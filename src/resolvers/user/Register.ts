import {Arg, Mutation, Query, Resolver} from "type-graphql";
import {User} from "../../entities/User";


@Resolver()
export class UserRegister {

    // @Mutation(() => User)
    // async register(@Arg("name") name: string): Promise<User> {
    //     return await User.create({
    //         username2: name,
    //     }).save();
    // }

}