import {Field, ObjectType} from "@nestjs/graphql";
import {JSONResolver, URLResolver} from "graphql-scalars";

@ObjectType()
export class ThemeAssetsModel {

    @Field(() => JSONResolver, {nullable: true})
    customLayoutJson?: JSON;

    @Field(() => JSONResolver, {nullable: true})
    customCommonLayoutJson?: JSON;

    @Field(() => URLResolver, {nullable: true})
    image: string;

    @Field(() => URLResolver, {nullable: true})
    albumIcon: string;

    @Field(() => URLResolver, {nullable: true})
    newsIcon: string;

    @Field(() => URLResolver, {nullable: true})
    shopIcon: string;

    @Field(() => URLResolver, {nullable: true})
    controllerIcon: string;

    @Field(() => URLResolver, {nullable: true})
    settingsIcon: string;

    @Field(() => URLResolver, {nullable: true})
    powerIcon: string;

    @Field(() => URLResolver, {nullable: true})
    homeIcon: string;

}