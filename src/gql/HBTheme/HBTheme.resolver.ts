import {Args, ArgsType, Field, Parent, Query, ResolveField, Resolver} from "@nestjs/graphql";
import {Target} from "../common/enums/Target";
import {HBThemeModel} from "./HBTheme.model";
import {HBThemeService} from "./HBTheme.service";
import {LimitArg, PaginationArgs} from "../common/args/Pagination.args";
import {UserService} from "../User/User.service";
import {UserModel} from "../User/User.model";
import {HBThemeEntity} from "./HBTheme.entity";
import {ItemSortArgs} from "../common/args/ItemSortArgs";


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
    @Field({nullable: true})
    includeNSFW: boolean = false;

}

@Resolver(HBThemeModel)
export class HBThemeResolver {

    constructor(private hbThemeService: HBThemeService, private userService: UserService) {
    }

    @ResolveField(() => UserModel)
    async creator(@Parent() hbTheme: HBThemeEntity): Promise<UserModel> {
        const id = hbTheme.creatorId;
        return this.userService.findOne({id});
    }

    @Query(() => HBThemeModel, {
        description: `Find a single hbtheme`,
    })
    async HBtheme(
        @Args("id", {nullable: false}) id: string,
    ): Promise<HBThemeModel> {
        return this.hbThemeService.findOne({id});
    }

    @Query(() => [HBThemeModel], {
        description: `Find multiple hbthemes`,
    })
    async HBthemes(
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortArgs: ItemSortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<HBThemeModel[]> {
        return this.hbThemeService.findAll({
            paginationArgs,
            ...itemSortArgs,
            ...listArgs,
        });
    }

    @Query(() => [HBThemeModel], {
        description: `Fetch random hbthemes`,
    })
    async randomHBThemes(
        @Args() limitArg?: LimitArg,
        @Args("includeNSFW", {nullable: true}) includeNSFW: boolean = false,
    ): Promise<HBThemeModel[]> {
        return this.hbThemeService.findRandom({
            ...limitArg,
            includeNSFW,
        });
    }

}
