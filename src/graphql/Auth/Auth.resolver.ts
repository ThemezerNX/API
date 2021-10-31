import {AuthService} from "./Auth.service";
import {Args, Context, Mutation, Query, Resolver} from "@nestjs/graphql";
import {UseGuards} from "@nestjs/common";
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
    register(@Args("registerData") {email, password, username}: RegisterData): Promise<UserModel> {
        return this.authService.register(email, password, username);
    }

    @Mutation(() => Boolean)
    verifyEmail(@Args("verificationData") {userId, verificationToken}: VerificationData): Promise<boolean> {
        return this.authService.verifyEmail(userId, verificationToken);
    }

    @Mutation(() => UserModel)
    @UseGuards(LocalLoginGuard)
    login(@Args("loginData") loginData: LoginData, @CurrentUser() user: UserEntity): UserModel {
        return user;
    }

    @Mutation(() => Boolean)
    logout(@Context() context): boolean {
        context.req.logout();
        context.req.session.destroy();
        context.req.res.clearCookie("connect.sid");
        return true;
    }

    @Query(() => UserModel)
    @Auth()
    me(@CurrentUser() user: UserEntity): UserModel {
        return user;
    }


}