import {Field, Int, ObjectType} from "@nestjs/graphql";


@ObjectType()
export class DiscordConnectionModel {

    @Field()
    username: string;

    @Field(() => Int)
    discriminator: number;

    @Field()
    avatarHash: string;

}