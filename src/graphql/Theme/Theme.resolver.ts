import {Args, Info, Mutation, Query, Resolver} from "@nestjs/graphql";
import {Target} from "../common/enums/Target";
import {ThemeModel} from "./Theme.model";
import {ThemeService} from "./Theme.service";
import {LimitArg, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSortArgs} from "../common/args/ItemSort.args";
import {PaginatedThemes} from "./PaginatedThemes.model";
import {ThemeNotFoundError} from "../common/errors/ThemeNotFound.error";
import {ListArgs} from "./dto/List.args";
import {SubmitThemesArgs} from "./dto/SubmitThemes.args";
import {SubmitPackWithThemesArgs} from "./dto/SubmitPatkWithThemes.args";
import {UserEntity} from "../User/User.entity";
import {GraphQLResolveInfo} from "graphql";
import {CurrentUser} from "../../common/decorators/CurrentUser.decorator";
import {Auth} from "../../common/decorators/Auth.decorator";
import {checkAccessPermissions} from "../common/functions/checkAccessPermissions";


@Resolver(ThemeModel)
export class ThemeResolver {

    constructor(private themeService: ThemeService) {
    }

    @Query(() => ThemeModel, {
        description: `Find a single theme`,
    })
    async theme(
        @Info() info: GraphQLResolveInfo,
        @CurrentUser() user: UserEntity,
        @Args("id") id: string,
    ): Promise<ThemeModel> {
        const theme = await this.themeService.findOne({id}, {info});
        if (!theme) {
            throw new ThemeNotFoundError();
        }
        checkAccessPermissions(theme, user);
        return new ThemeModel(theme);
    }

    @Query(() => PaginatedThemes, {
        description: `Find multiple themes`,
    })
    async themes(
        @Info() info: GraphQLResolveInfo,
        @CurrentUser() user: UserEntity,
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortArgs: ItemSortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<PaginatedThemes> {
        const result = await this.themeService.findAll({
            paginationArgs,
            ...itemSortArgs,
            ...listArgs,
            visibility: {currentUserId: user?.id, forceSelect: user?.isAdmin},
        }, {info, rootField: "nodes"});

        return new PaginatedThemes(
            paginationArgs,
            result.count,
            result.result.map((u) => new ThemeModel(u)),
        );
    }

    @Query(() => [ThemeModel], {
        description: `Fetch random themes. Does not include private items.`,
    })
    async randomThemes(
        @Info() info: GraphQLResolveInfo,
        @Args() limitArg?: LimitArg,
        @Args("includeNSFW", {defaultValue: false}) includeNSFW: boolean = false,
        @Args("target", {nullable: true}) target?: Target,
    ): Promise<ThemeModel[]> {
        return (
            await this.themeService.findRandom({
                ...limitArg,
                includeNSFW,
                target,
            }, {info})
        ).map((u) => new ThemeModel(u));
    }

    @Mutation(() => Boolean)
    @Auth()
    async submitPackWithThemes(
        @CurrentUser() user: UserEntity,
        @Args() {
            makePrivate,
            themesData,
            hbthemesData,
            packData,
        }: SubmitPackWithThemesArgs,
    ): Promise<boolean> {
        await this.themeService.insertMultiple(user, makePrivate, themesData, hbthemesData, packData);
        return true;
    }

    @Mutation(() => Boolean)
    @Auth()
    async submitThemes(@CurrentUser() user: UserEntity, @Args() {
        makePrivate,
        themesData,
        hbthemesData,
    }: SubmitThemesArgs): Promise<boolean> {
        await this.themeService.insertMultiple(user, makePrivate, themesData, hbthemesData, null);
        return true;
    }

    @Mutation(() => Boolean, {
        description: "Delete a theme.",
    })
    @Auth({ownerOnly: true})
    async deleteTheme(@Args("id") id: string): Promise<boolean> {
        await this.themeService.delete({ids: [id]});
        return true;
    }

    @Mutation(() => Boolean, {
        description: "Make a theme private/public. The creator is sent an email with the reason.",
    })
    @Auth({ownerOnly: true})
    async setThemeVisibility(@Args("id") id: string, @Args("makePrivate") makePrivate: boolean, @Args("reason") reason: string): Promise<boolean> {
        await this.themeService.setVisibility({id}, makePrivate, reason);
        return true;
    }

}