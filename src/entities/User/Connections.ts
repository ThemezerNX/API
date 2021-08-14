import {Field, ObjectType} from "type-graphql";
import {DiscordConnection} from "./Discord";
import {JoinColumn, OneToOne} from "typeorm";

@ObjectType()
export class UserConnections {

    @Field(() => DiscordConnection)
    @JoinColumn()
    discord: DiscordConnection;

}

