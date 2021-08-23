import {Field, ObjectType} from "type-graphql";
import {DiscordConnection} from "./DiscordConnection";
import {Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@ObjectType()
@Entity()
export class UserConnections {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, user => user.connections, {onDelete: "CASCADE"})
    @JoinColumn()
    user: User;

    @Field(() => DiscordConnection)
    @OneToOne(() => DiscordConnection,
        discordConnection => discordConnection.userConnections,
        {cascade: true, eager: true})
    discord?: DiscordConnection;

}

