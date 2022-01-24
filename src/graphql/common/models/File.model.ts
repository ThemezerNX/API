import {Field, ObjectType} from "@nestjs/graphql";

@ObjectType("File")
export class FileModel {

    constructor(fileName, data, mimetype) {
        this.fileName = fileName;
        this.data = data;
        this.mimetype = mimetype;
    }

    @Field()
    fileName: string;

    @Field()
    data: string;

    @Field()
    mimetype: string;

}