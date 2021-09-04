import {Field, Int, ObjectType} from "@nestjs/graphql";


@ObjectType("DiscordConnection")
export class DiscordConnectionModel {

    @Field()
    username: string;

    @Field(() => Int)
    discriminator: number;

    @Field()
    avatarHash: string;

}