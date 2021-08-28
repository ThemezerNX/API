import {Args, ArgsType, Field, Parent, Query, ResolveField, Resolver} from "@nestjs/graphql";
import {Target} from "../common/enums/Target";
import {LayoutModel} from "./Layout.model";
import {LayoutService} from "./Layout.service";
import {LimitArg, PaginationArgs} from "../common/args/Pagination.args";
import {UserService} from "../User/User.service";
import {UserModel} from "../User/User.model";
import {LayoutEntity} from "./Layout.entity";
import {ItemSortArgs} from "../common/args/ItemSortArgs";
import {PaginatedLayouts} from "./PaginatedLayouts.model";


@ArgsType()
class ListArgs {

    @Field(() => Target, {nullable: true})
    target?: Target;
    @Field({nullable: true})
    query?: string;
    @Field(() => [String], {nullable: true})
    creators?: string[];

}

@Resolver(LayoutModel)
export class LayoutResolver {

    constructor(private layoutService: LayoutService, private userService: UserService) {
    }

    @ResolveField(() => UserModel)
    async creator(@Parent() layout: LayoutEntity): Promise<UserModel> {
        const id = layout.creatorId;
        return this.userService.findOne({id});
    }

    @Query(() => LayoutModel, {
        description: `Find a single layout`,
    })
    async layout(
        @Args("id", {nullable: false}) id: string,
    ): Promise<LayoutModel> {
        return this.layoutService.findOne({id});
    }

    @Query(() => PaginatedLayouts, {
        description: `Find multiple layouts`,
    })
    async layouts(
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortArgs: ItemSortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<PaginatedLayouts> {
        const result = await this.layoutService.findAll({
            paginationArgs,
            ...itemSortArgs,
            ...listArgs,
        });

        return new PaginatedLayouts(paginationArgs, result[1], result[0]);
    }

    @Query(() => [LayoutModel], {
        description: `Fetch random layouts`,
    })
    async randomLayouts(
        @Args() limitArg?: LimitArg,
    ): Promise<LayoutModel[]> {
        return this.layoutService.findRandom({
            ...limitArg,
        });
    }

}
