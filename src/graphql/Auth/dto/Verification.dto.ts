import {Field, InputType} from "@nestjs/graphql";
import {IsUserId} from "../../common/decorators/validators/IsUserId";

@InputType()
export class VerificationData {

    @Field()
    @IsUserId()
    userId: string;

    @Field()
    verificationToken: string;

}