import {Field, ID, ObjectType} from "@nestjs/graphql";
import {URLResolver} from "graphql-scalars";

@ObjectType()
export class NXInstallerTheme {

    @Field(() => ID)
    id: string;

    @Field(() => ID)
    name: string;

    @Field(() => ID)
    target: string;

    @Field(() => URLResolver)
    url: string;

    @Field(() => URLResolver)
    preview: string;

    @Field(() => URLResolver)
    thumbnail: string;

}

@ObjectType("NXInstaller")
export class NXInstallerModel {

    @Field({nullable: true})
    groupname?: string;

    @Field(() => [NXInstallerTheme])
    themes: NXInstallerTheme[];

}