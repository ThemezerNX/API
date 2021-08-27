import {Args, ArgsType, Field, Parent, Query, ResolveField, Resolver} from "@nestjs/graphql";
import {Target} from "../common/enums/Target";
import {HBThemeModel} from "./HBTheme.model";
import {HBThemeService} from "./HBTheme.service";
import {PaginationArgs} from "../common/args/Pagination.args";
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
    includeNSFW?: boolean;

}

@Resolver(HBThemeModel)
export class HBThemeResolver {

    constructor(private themeService: HBThemeService, private userService: UserService) {
    }

    @Query(() => HBThemeModel, {
        description: `Find a single hbtheme`,
    })
    async hbtheme(
        @Args("id", {nullable: false}) id: string,
    ): Promise<HBThemeModel> {
        return this.themeService.findOne({id});
    }

    @Query(() => [HBThemeModel], {
        description: `Find multiple hbthemes`,
    })
    async hbthemes(
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortArgs: ItemSortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<HBThemeModel[]> {
        return this.themeService.findAll({
            paginationArgs,
            ...itemSortArgs,
            ...listArgs,
        });
    }

    @ResolveField(() => UserModel)
    async creator(@Parent() hbTheme: HBThemeEntity): Promise<UserModel> {
        const id = hbTheme.creatorId;
        return this.userService.findOne({id});
    }

}
