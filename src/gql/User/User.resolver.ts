import {Args, Query, Resolver} from "@nestjs/graphql";
import {UserService} from "./User.service";
import {UserModel} from "./User.model";

@Resolver(UserModel)
export class UserResolver {

    constructor(private userService: UserService) {
    }

    @Query(() => [UserModel], {
        description: `Generic Collection Query For Users`,
    })
    async users(
        @Args("query", {nullable: true}) query?: string,
    ): Promise<UserModel[]> {
        return this.userService.findAll();
    }

}