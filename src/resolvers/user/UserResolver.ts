import {Arg, Query, Resolver} from "type-graphql";
import {User} from "../../entities/User/User";


@Resolver()
export class UserResolver {

    @Query(() => User)
    async user(@Arg("id") id: string): Promise<User> {
        return User.findOneOrFail(id);
    }

}