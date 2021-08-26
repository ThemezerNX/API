import {Field, ObjectType} from "@nestjs/graphql";
import {URLResolver} from "graphql-scalars";

@ObjectType()
export class HBThemeAssetsModel {

    @Field(() => URLResolver, {nullable: true})
    batteryIconUrl: string;

    @Field(() => URLResolver, {nullable: true})
    chargingIconUrl: string;

    @Field(() => URLResolver, {nullable: true})
    folderIconUrl: string;

    @Field(() => URLResolver, {nullable: true})
    invalidIconUrl: string;

    @Field(() => URLResolver, {nullable: true})
    themeIconDarkUrl: string;

    @Field(() => URLResolver, {nullable: true})
    themeIconLightUrl: string;

    @Field(() => URLResolver, {nullable: true})
    airplaneIconUrl: string;

    @Field(() => URLResolver, {nullable: true})
    wifiNoneIconUrl: string;

    @Field(() => URLResolver, {nullable: true})
    wifi1IconUrl: string;

    @Field(() => URLResolver, {nullable: true})
    wifi2IconUrl: string;

    @Field(() => URLResolver, {nullable: true})
    wifi3IconUrl: string;

    @Field(() => URLResolver, {nullable: true})
    ethIconUrl: string;

    @Field(() => URLResolver, {nullable: true})
    backgroundImageUrl: string;

}