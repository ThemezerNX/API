import {Field, InputType} from "@nestjs/graphql";
import {IsHexColor, IsOptional, Length} from "class-validator";
import {Exclude} from "class-transformer";
import {FileUpload, GraphQLUpload} from "graphql-upload";
import {HexColorCodeResolver} from "graphql-scalars";

@InputType({description: "Acts as a patch. Undefined fields are not updated, null fields are set to null."})
export class UpdateUserProfileDataInput {

    @Length(0, 10000)
    @Field({nullable: true})
    @IsOptional()
    bio?: string;

    @Length(6, 6)
    @IsHexColor()
    @IsOptional()
    @Field(() => HexColorCodeResolver, {nullable: true})
    color?: string;

    @Exclude()
    @Field(() => GraphQLUpload, {description: "An avatar. May be transparent.", nullable: true})
    avatar?: Promise<FileUpload>;

    @Exclude()
    @Field(() => GraphQLUpload, {description: "The banner that is shown on the user's page.", nullable: true})
    banner?: Promise<FileUpload>;

}