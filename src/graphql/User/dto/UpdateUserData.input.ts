import {Field, InputType} from "@nestjs/graphql";
import {IsOptional, Length} from "class-validator";
import {ValidateChild} from "../../common/decorators/ValidateNested.decorator";
import {UpdateProfileDataInput} from "./UpdateProfileData.input";

@InputType({description: "Acts as a patch. Undefined fields are not updated, null fields are set to null."})
export class UpdateUserDataInput {

    @Length(2, 32)
    @Field({nullable: true})
    @IsOptional()
    username?: string;

    @Field(() => UpdateProfileDataInput, {nullable: true})
    @ValidateChild(() => UpdateProfileDataInput)
    @IsOptional()
    profile?: UpdateProfileDataInput;

}