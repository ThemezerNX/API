import {Field, ObjectType} from "@nestjs/graphql";
import {HexColorCodeResolver, URLResolver} from "graphql-scalars";
import {RootModelAbstract} from "../../common/interfaces/Root.model.abstract";

@ObjectType("UserProfile")
export class UserProfileModel extends RootModelAbstract {

    @Field({nullable: true})
    bio?: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    color?: string;

    @Field(() => URLResolver, {description: "WebP image", nullable: true})
    avatarUrl?: string;

    @Field(() => URLResolver, {description: "WebP image", nullable: true})
    bannerUrl?: string;

}