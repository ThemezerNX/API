import {Field, ObjectType} from "@nestjs/graphql";
import {DiscordConnectionModel} from "./DiscordConnection.model";

@ObjectType("UserConnections")
export class UserConnectionsModel {

    @Field(() => DiscordConnectionModel, {nullable: true})
    discord?: DiscordConnectionModel;

}

