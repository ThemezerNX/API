import {Field, InputType} from "@nestjs/graphql";
import {ArrayMaxSize, ArrayMinSize, IsOptional, IsString, Length} from "class-validator";
import {Exclude} from "class-transformer";
import {FileUpload, GraphQLUpload} from "graphql-upload";

@InputType({isAbstract: true})
export class ThemeItemDataInputInterface {

    @Length(3, 100)
    @Field()
    name: string;

    @Field({nullable: true})
    @Length(10, 1000)
    @IsOptional()
    description?: string;

    @Field({
        defaultValue: false,
        description: "Whether the theme is NSFW. Note: if one of the themes in a pack is NSFW, the pack will be treated as NSFW.",
    })
    isNSFW: boolean = false;

    @Field(() => [String], {description: "Inexistent tags will be created."})
    @ArrayMinSize(1)
    @ArrayMaxSize(10)
    @IsString({each: true})
    @Length(2, 60, {each: true})
    tags: string[];

    @Exclude()
    @Field(() => GraphQLUpload, {description: "A theme screenshot. Must be taken on the Switch."})
    screenshot: Promise<FileUpload>;

}