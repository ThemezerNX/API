import {Field, InputType} from "@nestjs/graphql";
import {IsOptional, Length} from "class-validator";
import {FileUpload, GraphQLUpload} from "graphql-upload";
import {Exclude} from "class-transformer";

@InputType({description: "Acts as a patch. Undefined fields are not updated, null fields are set to null."})
export class UpdatePackDataInput {

    @Field({nullable: true})
    @Length(3, 100)
    name?: string;

    @Field({nullable: true})
    @Length(10, 10000)
    @IsOptional()
    description?: string;

    @Field(() => GraphQLUpload, {
        nullable: true,
        description: "A custom pack preview image. If none is provided, a collage will be created automatically.",
    })
    @Exclude()
    preview?: Promise<FileUpload>;

    // Do not support this for now. Use the dedicated updateVisibility mutation for this
    // makePrivate: boolean;

}