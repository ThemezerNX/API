import {ArgsType, Field} from "@nestjs/graphql";
import {FileUpload, GraphQLUpload} from "graphql-upload";
import {Exclude} from "class-transformer";

@ArgsType()
export class CreateOverlayArgs {

    @Field(() => GraphQLUpload)
    @Exclude()
    blackImage: Promise<FileUpload>;

    @Field(() => GraphQLUpload)
    @Exclude()
    whiteImage: Promise<FileUpload>;

}
