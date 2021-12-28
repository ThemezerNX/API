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
import {CurrentUser} from "../Auth/decorators/CurrentUser.decorator";
import {UserEntity} from "../User/User.entity";
import {Auth} from "../Auth/decorators/Auth.decorator";
import {GraphQLResolveInfo} from "graphql";


@Resolver(ThemeModel)
export class ThemeResolver {

    constructor(private themeService: ThemeService) {
    }

    @Query(() => ThemeModel, {
        description: `Find a single theme`,
    })
    async theme(
        @Info() info: GraphQLResolveInfo,
        @Args("id") id: string,
    ): Promise<ThemeModel> {
        const theme = await this.themeService.findOne({id}, {info});
        if (!theme) {
            throw new ThemeNotFoundError();
        }
        return new ThemeModel(theme);
    }

    @Query(() => PaginatedThemes, {
        description: `Find multiple themes`,
    })
    async themes(
        @Info() info: GraphQLResolveInfo,
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortArgs: ItemSortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<PaginatedThemes> {
        const result = await this.themeService.findAll({
            paginationArgs,
            ...itemSortArgs,
            ...listArgs,
        }, {info, rootField: "nodes"});

        return new PaginatedThemes(
            paginationArgs,
            result.count,
            result.result.map((u) => new ThemeModel(u)),
        );
    }

    @Query(() => [ThemeModel], {
        description: `Fetch random themes`,
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
    async submitPackWithThemes(@CurrentUser() user: UserEntity, @Args() {
        themesData,
        hbthemesData,
        packData,
    }: SubmitPackWithThemesArgs): Promise<boolean> {
        await this.themeService.insertMultiple(user, themesData, hbthemesData, packData);
        return true;
    }

    @Mutation(() => Boolean)
    @Auth()
    async submitThemes(@CurrentUser() user: UserEntity, @Args() {themesData, hbthemesData}: SubmitThemesArgs): Promise<boolean> {
        await this.themeService.insertMultiple(user, themesData, hbthemesData, null);
        return true;
    }

}