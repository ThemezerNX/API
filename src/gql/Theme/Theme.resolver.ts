import {Args, ArgsType, Field, Parent, Query, ResolveField, Resolver} from "@nestjs/graphql";
import {Target} from "../common/enums/Target";
import {ThemeModel} from "./Theme.model";
import {ThemeService} from "./Theme.service";
import {PaginationArgs} from "../common/args/Pagination.args";
import {UserService} from "../User/User.service";
import {UserModel} from "../User/User.model";
import {ThemeEntity} from "./Theme.entity";
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

@Resolver(ThemeModel)
export class ThemeResolver {

    constructor(private themeService: ThemeService, private userService: UserService) {
    }

    @Query(() => ThemeModel, {
        description: `Find a single theme`,
    })
    async theme(
        @Args("id", {nullable: false}) id: string,
    ): Promise<ThemeModel> {
        return this.themeService.findOne({id});
    }

    @Query(() => [ThemeModel], {
        description: `Find multiple themes`,
    })
    async themes(
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortArgs: ItemSortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<ThemeModel[]> {
        return this.themeService.findAll({
            paginationArgs,
            ...itemSortArgs,
            ...listArgs,
        });
    }

    @ResolveField(() => UserModel)
    async creator(@Parent() theme: ThemeEntity): Promise<UserModel> {
        const id = theme.creatorId;
        return this.userService.findOne({id});
    }

}
