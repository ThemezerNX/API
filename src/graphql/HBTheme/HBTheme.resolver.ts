import {Args, ArgsType, Field, Parent, Query, ResolveField, Resolver} from "@nestjs/graphql";
import {Target} from "../common/enums/Target";
import {HBThemeModel} from "./HBTheme.model";
import {HBThemeService} from "./HBTheme.service";
import {LimitArg, PaginationArgs} from "../common/args/Pagination.args";
import {UserService} from "../User/User.service";
import {UserModel} from "../User/User.model";
import {HBThemeEntity} from "./HBTheme.entity";
import {ItemSortArgs} from "../common/args/ItemSortArgs";
import {PaginatedHBThemes} from "./PaginatedHBThemes.model";


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

    constructor(private hbthemeService: HBThemeService, private userService: UserService) {
    }

    @ResolveField(() => UserModel)
    creator(@Parent() hbtheme: HBThemeEntity): Promise<UserModel> {
        return this.userService.findOne({id: hbtheme.creatorId});
    }

    @Query(() => HBThemeModel, {
        description: `Find a single hbtheme`,
    })
    hbtheme(
        @Args("id") id: string,
    ): Promise<HBThemeModel> {
        return this.hbthemeService.findOne({id});
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
