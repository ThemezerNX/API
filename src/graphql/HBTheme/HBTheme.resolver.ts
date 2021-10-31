import {Args, Query, Resolver} from "@nestjs/graphql";
import {HBThemeModel} from "./HBTheme.model";
import {HBThemeService} from "./HBTheme.service";
import {LimitArg, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSortArgs} from "../common/args/ItemSort.args";
import {PaginatedHBThemes} from "./PaginatedHBThemes.model";
import {HBThemeNotFoundError} from "../common/errors/HBThemeNotFound.error";
import {ListArgs} from "./dto/List.args";


@Resolver(HBThemeModel)
export class HBThemeResolver {

    constructor(private hbthemeService: HBThemeService) {
    }

    @Query(() => HBThemeModel, {
        description: `Find a single hbtheme`,
    })
    async hbtheme(
        @Args("id") id: string,
    ): Promise<HBThemeModel> {
        const hbtheme = await this.hbthemeService.findOne({id});
        if (!hbtheme) {
            throw new HBThemeNotFoundError();
        }
        return hbtheme;
    }

    @Query(() => PaginatedHBThemes, {
        description: `Find multiple hbthemes`,
    })
    async hbthemes(
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortArgs: ItemSortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<PaginatedHBThemes> {
        const result = await this.hbthemeService.findAll({
            paginationArgs,
            ...itemSortArgs,
            ...listArgs,
        });

        return new PaginatedHBThemes(paginationArgs, result.count, result.result);
    }

    @Query(() => [HBThemeModel], {
        description: `Fetch random hbthemes`,
    })
    randomHBThemes(
        @Args() limitArg?: LimitArg,
        @Args("includeNSFW", {defaultValue: false}) includeNSFW: boolean = false,
    ): Promise<HBThemeModel[]> {
        return this.hbthemeService.findRandom({
            ...limitArg,
            includeNSFW,
        });
    }

}
