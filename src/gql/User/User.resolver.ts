import {Args, Query, Resolver} from "@nestjs/graphql";
import {UserService} from "./User.service";
import {UserModel} from "./User.model";
import {PaginationArgs} from "../common/args/Pagination.args";

@Resolver(UserModel)
export class UserResolver {

    constructor(private userService: UserService) {
    }

    @Query(() => UserModel, {
        description: `Find a single user`,
    })
    async user(
        @Args("id", {nullable: false}) id: string,
    ): Promise<UserModel> {
        return this.userService.findOne({id});
    }

    @Query(() => [UserModel], {
        description: `Find multiple users`,
    })
    async users(
        @Args() paginationArgs: PaginationArgs,
        @Args("query", {nullable: true}) query?: string,
    ): Promise<UserModel[]> {
        return this.userService.findAll({paginationArgs, query});
    }

}