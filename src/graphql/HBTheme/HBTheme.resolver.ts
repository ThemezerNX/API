import {Args, Info, Mutation, Query, Resolver} from "@nestjs/graphql";
import {HBThemeModel} from "./HBTheme.model";
import {HBThemeService} from "./HBTheme.service";
import {LimitArg, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSortArgs} from "../common/args/ItemSort.args";
import {PaginatedHBThemes} from "./PaginatedHBThemes.model";
import {HBThemeNotFoundError} from "../common/errors/HBThemeNotFound.error";
import {ListArgs} from "./dto/List.args";
import {GraphQLResolveInfo} from "graphql";
import {Auth} from "../../common/decorators/Auth.decorator";
import {checkAccessPermissions} from "../common/functions/checkAccessPermissions";
import {CurrentUser} from "../../common/decorators/CurrentUser.decorator";
import {UserEntity} from "../User/User.entity";


@Resolver(HBThemeModel)
export class HBThemeResolver {

    constructor(private hbthemeService: HBThemeService) {
    }

    @Query(() => HBThemeModel, {
        description: `Find a single hbtheme`,
    })
    async hbtheme(
        @Info() info: GraphQLResolveInfo,
        @CurrentUser() user: UserEntity,
        @Args("id") id: string,
    ): Promise<HBThemeModel> {
        const hbtheme = await this.hbthemeService.findOne({id}, {info});
        if (!hbtheme) {
            throw new HBThemeNotFoundError();
        }
        checkAccessPermissions(hbtheme, user);
        return new HBThemeModel(hbtheme);
    }

    @Query(() => PaginatedHBThemes, {
        description: `Find multiple hbthemes`,
    })
    async hbthemes(
        @Info() info: GraphQLResolveInfo,
        @CurrentUser() user: UserEntity,
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortArgs: ItemSortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<PaginatedHBThemes> {
        const result = await this.hbthemeService.findAll({
            paginationArgs,
            ...itemSortArgs,
            ...listArgs,
            visibility: {currentUserId: user?.id, forceSelect: user?.isAdmin},
        }, {info, rootField: "nodes"});

        return new PaginatedHBThemes(
            paginationArgs,
            result.count,
            result.result.map((u) => new HBThemeModel(u)),
        );
    }

    @Query(() => [HBThemeModel], {
        description: `Fetch random hbthemes. Does not include private items.`,
    })
    async randomHBThemes(
        @Info() info: GraphQLResolveInfo,
        @Args() limitArg?: LimitArg,
        @Args("includeNSFW", {defaultValue: false}) includeNSFW: boolean = false,
    ): Promise<HBThemeModel[]> {
        return (
            await this.hbthemeService.findRandom({
                ...limitArg,
                includeNSFW,
            }, {info})
        )
            .map((u) => new HBThemeModel(u));
    }

    @Mutation(() => Boolean, {
        description: "Delete a hbtheme.",
    })
    @Auth({ownerOnly: true})
    async deleteHbtheme(@Args("id") id: string): Promise<boolean> {
        await this.hbthemeService.delete({ids: [id]});
        return true;
    }

    @Mutation(() => Boolean, {
        description: "Make a hbtheme private/public. The creator is sent an email with the reason.",
    })
    @Auth({ownerOnly: true})
    async setHbthemeVisibility(@Args("id") id: string, @Args("makePrivate") makePrivate: boolean, @Args("reason") reason: string): Promise<boolean> {
        await this.hbthemeService.setVisibility({id}, makePrivate, reason);
        return true;
    }

}
