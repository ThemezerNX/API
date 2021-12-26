import {AuthService} from "./Auth.service";
import {Args, Context, Mutation, Query, Resolver} from "@nestjs/graphql";
import {SerializeOptions, UseGuards} from "@nestjs/common";
import {LocalLoginGuard} from "./Strategies/Local/strategy/LocalLogin.guard";
import {UserModel} from "../User/User.model";
import {UserEntity} from "../User/User.entity";
import {RegisterData} from "./dto/Register.dto";
import {VerificationData} from "./dto/Verification.dto";
import {LoginData} from "./dto/Login.dto";
import {CurrentUser} from "./decorators/CurrentUser.decorator";
import {Auth} from "./decorators/Auth.decorator";


@Resolver()
export class AuthResolver {

    constructor(private authService: AuthService) {
    }

    @Mutation(() => UserModel)
    @SerializeOptions({groups: ["owner"]})
    async register(@Args("registerData") {email, password, username}: RegisterData): Promise<UserModel> {
        return new UserModel(await this.authService.register(email, password, username));
    }

    @Mutation(() => Boolean)
    verifyEmail(@Args("verificationData") {userId, verificationToken}: VerificationData): Promise<boolean> {
        return this.authService.verifyEmail(userId, verificationToken);
    }

    @Mutation(() => UserModel)
    @UseGuards(LocalLoginGuard)
    @SerializeOptions({groups: ["owner"]})
    login(@Args("loginData") loginData: LoginData, @CurrentUser() user: UserEntity): UserModel {
        return new UserModel(user);
    }

    @Mutation(() => Boolean)
    logout(@Context() context): boolean {
        context.req.res.clearCookie("connect.sid");
        context.req.session.destroy();
        context.req.logout();
        return true;
    }

    @Query(() => UserModel)
    @Auth({defineSerializeMetadata: false})
    @SerializeOptions({groups: ["owner"]})
    me(@CurrentUser() user: UserEntity): UserModel {
        return new UserModel(user);
    }


}