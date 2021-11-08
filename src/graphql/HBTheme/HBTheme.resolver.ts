import {Args, Info, Query, Resolver} from "@nestjs/graphql";
import {HBThemeModel} from "./HBTheme.model";
import {HBThemeService} from "./HBTheme.service";
import {LimitArg, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSortArgs} from "../common/args/ItemSort.args";
import {PaginatedHBThemes} from "./PaginatedHBThemes.model";
import {HBThemeNotFoundError} from "../common/errors/HBThemeNotFound.error";
import {ListArgs} from "./dto/List.args";
import {GraphQLResolveInfo} from "graphql";


@Resolver(HBThemeModel)
export class HBThemeResolver {

    constructor(private hbthemeService: HBThemeService) {
    }

    @Query(() => HBThemeModel, {
        description: `Find a single hbtheme`,
    })
    async hbtheme(
        @Info() info: GraphQLResolveInfo,
        @Args("id") id: string,
    ): Promise<HBThemeModel> {
        const hbtheme = await this.hbthemeService.findOne({id}, {info});
        if (!hbtheme) {
            throw new HBThemeNotFoundError();
        }
        return new HBThemeModel(hbtheme);
    }

    @Query(() => PaginatedHBThemes, {
        description: `Find multiple hbthemes`,
    })
    async hbthemes(
        @Info() info: GraphQLResolveInfo,
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortArgs: ItemSortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<PaginatedHBThemes> {
        const result = await this.hbthemeService.findAll({
            paginationArgs,
            ...itemSortArgs,
            ...listArgs,
        }, {info, rootField: "nodes"});

        return new PaginatedHBThemes(
            paginationArgs,
            result.count,
            result.result.map((u) => new HBThemeModel(u)),
        );
    }

    @Query(() => [HBThemeModel], {
        description: `Fetch random hbthemes`,
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

}
