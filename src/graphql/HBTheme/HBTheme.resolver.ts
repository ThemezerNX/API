import {Args, ArgsType, Field, Query, Resolver} from "@nestjs/graphql";
import {Target} from "../common/enums/Target";
import {HBThemeModel} from "./HBTheme.model";
import {HBThemeService} from "./HBTheme.service";
import {LimitArg, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSortArgs} from "../common/args/ItemSortArgs";
import {PaginatedHBThemes} from "./PaginatedHBThemes.model";
import {HBThemeNotFoundError} from "../common/errors/HBThemeNotFound.error";


@ArgsType()
class ListArgs {

    @Field(() => Target, {nullable: true})
    target?: Target;
    @Field({nullable: true})
    query?: string;
    @Field(() => [String], {nullable: true})
    creators?: string[];
    @Field(() => [String], {nullable: true})
    layouts?: string[];
    @Field({defaultValue: false})
    includeNSFW: boolean = false;

}

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
