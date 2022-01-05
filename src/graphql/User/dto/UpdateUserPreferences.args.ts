import {ArgsType, Field, InputType} from "@nestjs/graphql";
import {IsOptional} from "class-validator";

@ArgsType()
@InputType({description: "Acts as a patch. Undefined fields are not updated, null fields are set to null."})
export class UpdateUserProfileArgs {

    @Field({nullable: true})
    @IsOptional()
    showNSFW?: boolean;

    @Field({nullable: true})
    @IsOptional()
    notificationEmails?: boolean;

    @Field({nullable: true})
    @IsOptional()
    promotionEmails?: boolean;

}