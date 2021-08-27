import {Args, ArgsType, Field, Parent, Query, ResolveField, Resolver} from "@nestjs/graphql";
import {Target} from "../common/enums/Target";
import {LayoutModel} from "./Layout.model";
import {LayoutService} from "./Layout.service";
import {PaginationArgs} from "../common/args/Pagination.args";
import {UserService} from "../User/User.service";
import {UserModel} from "../User/User.model";
import {LayoutEntity} from "./Layout.entity";
import {ItemOrderArgs} from "../common/args/ItemOrder.args";


@ArgsType()
class LayoutListArgs {

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

    @Query(() => LayoutModel, {
        description: `Find a single layout`,
    })
    async layout(
        @Args("id", {nullable: false}) id: string,
    ): Promise<LayoutModel> {
        return this.layoutService.findOne({id});
    }

    @Query(() => [LayoutModel], {
        description: `Find multiple layouts`,
    })
    async layouts(
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortingArgs: ItemOrderArgs,
        @Args() layoutListArgs?: LayoutListArgs,
    ): Promise<LayoutModel[]> {
        return this.layoutService.findAll({
            paginationArgs,
            ...itemSortingArgs,
            ...layoutListArgs,
        });
    }

    @ResolveField(() => UserModel)
    async creator(@Parent() layout: LayoutEntity): Promise<UserModel> {
        const id = layout.creatorId;
        return this.userService.findOne({id});
    }

}
