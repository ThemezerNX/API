import {Field, ObjectType} from "@nestjs/graphql";
import {ByteResolver, UUIDResolver} from "graphql-scalars";

@ObjectType("File")
export class FileModel {

    constructor(filename, data, mimetype) {
        this.filename = filename;
        this.data = data;
        this.mimetype = mimetype
    }

    @Field()
    filename: string;

    @Field(() => [ByteResolver])
    data: Buffer;

    @Field()
    mimetype: string;

}