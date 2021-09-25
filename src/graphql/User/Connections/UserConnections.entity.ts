import {Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {DiscordConnectionEntity} from "./DiscordConnection.entity";
import {UserEntity} from "../User.entity";

@Entity("user_connections")
export class UserConnectionsEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => UserEntity, user => user.connections, {onDelete: "CASCADE"})
    @JoinColumn()
    user: UserEntity;

    @OneToOne(() => DiscordConnectionEntity,
        discordConnection => discordConnection.userConnections,
        {cascade: true, eager: true})
    discord?: DiscordConnectionEntity;

}

