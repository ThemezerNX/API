import {Field, InputType} from "@nestjs/graphql";

@InputType()
export class VerificationData {

    @Field()
    userId: string;

    @Field()
    verificationToken: string;

}