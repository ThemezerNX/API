import {Field, InputType} from "@nestjs/graphql";
import {IsEmail, MinLength} from "class-validator";

@InputType()
export class RegisterData {

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