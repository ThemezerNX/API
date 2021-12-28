import {Field, InputType} from "@nestjs/graphql";
import {IsOptional, Length} from "class-validator";
import {FileUpload, GraphQLUpload} from "graphql-upload";
import {Exclude} from "class-transformer";

@InputType()
export class PackDataInput {

    @Field()
    @Length(3, 100)
    name: string;

    @Field({nullable: true})
    @Length(10, 1000)
    @IsOptional()
    description?: string;

    @Field(() => GraphQLUpload, {
        nullable: true,
        description: "A custom pack preview image. If none is provided, a collage will be created automatically.",
    })
    @Exclude()
    preview?: Promise<FileUpload>;

}