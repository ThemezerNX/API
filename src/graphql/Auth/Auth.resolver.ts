import {AuthService} from "./Auth.service";
import {Args, Context, Field, InputType, Mutation, Query, Resolver} from "@nestjs/graphql";
import {IsEmail, MinLength} from "class-validator";
import {UseGuards} from "@nestjs/common";
import {LocalLoginGuard} from "./Strategies/Local/strategy/LocalLogin.guard";
import {UserModel} from "../User/User.model";
import {GqlAuthGuard} from "./GqlAuth.guard";
import {CurrentUser} from "../common/decorators/CurrentUser.decorator";
import {UserEntity} from "../User/User.entity";

@InputType()
class RegisterData {

    @Field()
    @IsEmail()
    email: string;

    @Field()
    @MinLength(8)
    password: string;

    @Field()
    @MinLength(4)
    username: string;

}

@InputType()
class LoginData {

    @Field()
    email: string;

    @Field()
    password: string;

}

@InputType()
class VerificationData {

    @Field()
    userId: string;

    @Field()
    verificationToken: string;

}



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
    @UseGuards(GqlAuthGuard)
    logout(@Context() context): boolean {
        context.req.logout()
        return true;
    }

    @Query(() => UserModel)
    @UseGuards(GqlAuthGuard)
    me(@CurrentUser() user: UserEntity): UserModel {
        return user;
    }


}