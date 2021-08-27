import {Args, ArgsType, Field, Query, registerEnumType, Resolver} from "@nestjs/graphql";
import {UserService} from "./User.service";
import {UserModel} from "./User.model";
import {PaginationArgs} from "../common/args/Pagination.args";
import {SortInterface} from "../common/interfaces/Sort.interface";

export enum UserSort {
    ID = "id",
    USERNAME = "username",
    JOINED = "joinedTimestamp"
}

registerEnumType(UserSort, {
    name: "UserSort",
});


@ArgsType()
export class SortArgs extends SortInterface {

    @Field(() => UserSort, {nullable: true})
    sort?: UserSort = UserSort.ID;

}

@ArgsType()
class ListArgs {

    @Field({nullable: true})
    query?: string;
    @Field({nullable: true})
    isAdmin?: boolean;

}

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
        @Args() sortArgs: SortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<UserModel[]> {
        return this.userService.findAll({
            paginationArgs,
            ...sortArgs,
            ...listArgs,
        });
    }

}