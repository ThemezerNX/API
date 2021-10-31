import {Field, InputType} from "@nestjs/graphql";

@InputType()
export class LoginData {

    @Field()
    email: string;

    @Field()
    password: string;

}