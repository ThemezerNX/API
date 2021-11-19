import {Args, Info, Query, Resolver} from "@nestjs/graphql";
import {UserService} from "./User.service";
import {UserModel} from "./User.model";
import {PaginationArgs} from "../common/args/Pagination.args";
import {PaginatedUsers} from "./PaginatedUsers.model";
import {UserNotFoundError} from "../common/errors/auth/UserNotFound.error";
import {ListArgs} from "./dto/List.args";
import {SortArgs} from "./dto/Sort.args";
import {GraphQLResolveInfo} from "graphql";


@Resolver(UserModel)
export class UserResolver {

    constructor(private userService: UserService) {
    }

    @Query(() => UserModel, {
        description: `Find a single user`,
    })
    async user(
        @Info() info: GraphQLResolveInfo,
        @Args("id") id: string,
    ): Promise<UserModel> {
        const user = await this.userService.findOne({id}, {info});
        if (!user) {
            throw new UserNotFoundError();
        }
        return new UserModel(user);
    }

    @Query(() => PaginatedUsers, {
        description: `Find multiple users`,
    })
    async users(
        @Info() info: GraphQLResolveInfo,
        @Args() paginationArgs: PaginationArgs,
        @Args() sortArgs: SortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<PaginatedUsers> {
        const result = await this.userService.findAll({
            paginationArgs,
            ...sortArgs,
            ...listArgs,
        }, {info});

        return new PaginatedUsers(
            paginationArgs,
            result.count,
            result.result.map((u) => new UserModel(u)),
        );
    }

}