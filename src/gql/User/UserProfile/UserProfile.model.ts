import {Field, ObjectType} from "@nestjs/graphql";
import {HexColorCodeResolver, URLResolver} from "graphql-scalars";

@ObjectType()
export class UserProfileModel {

    userId: string;

    @Field({nullable: true})
    bio?: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    color?: string;

    @Field(() => URLResolver, {description: "WebP image", nullable: true})
    avatarUrl?: string;

    @Field(() => URLResolver, {description: "WebP image", nullable: true})
    bannerUrl?: string;

}