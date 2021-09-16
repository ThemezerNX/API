import {Field, ObjectType} from "@nestjs/graphql";

@ObjectType("File")
export class FileModel {

    constructor(filename, data, mimetype) {
        this.filename = filename;
        this.data = data;
        this.mimetype = mimetype
    }

    @Field()
    filename: string;

    @Field(() => Buffer)
    data: Buffer;

    @Field()
    mimetype: string;

}