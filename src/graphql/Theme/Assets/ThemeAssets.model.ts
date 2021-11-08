import {Field, ObjectType} from "@nestjs/graphql";
import {JSONResolver, URLResolver} from "graphql-scalars";
import {RootModelAbstract} from "../../common/interfaces/Root.model.abstract";

@ObjectType("ThemeAssets")
export class ThemeAssetsModel extends RootModelAbstract {

    @Field(() => JSONResolver, {nullable: true})
    customLayoutJson?: string;

    @Field(() => JSONResolver, {nullable: true})
    customCommonLayoutJson?: string;

    @Field(() => URLResolver, {nullable: true})
    imageUrl?: string;

    @Field(() => URLResolver, {nullable: true})
    albumIconUrl?: string;

    @Field(() => URLResolver, {nullable: true})
    newsIconUrl?: string;

    @Field(() => URLResolver, {nullable: true})
    shopIconUrl?: string;

    @Field(() => URLResolver, {nullable: true})
    controllerIconUrl?: string;

    @Field(() => URLResolver, {nullable: true})
    settingsIconUrl?: string;

    @Field(() => URLResolver, {nullable: true})
    powerIconUrl?: string;

    @Field(() => URLResolver, {nullable: true})
    homeIconUrl?: string;

}