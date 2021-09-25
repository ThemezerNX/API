import {BaseEntity, Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {UserConnectionsEntity} from "./UserConnections.entity";


@Entity("discord_connection")
export class DiscordConnectionEntity extends BaseEntity {

    @OneToOne(() => UserConnectionsEntity,
        connections => connections.discord,
        {primary: true, onDelete: "CASCADE"})
    @JoinColumn()
    userConnections: UserConnectionsEntity;

    @Column()
    username: string;

    @Column("int")
    discriminator: number;

    @Column()
    avatarHash: string;

}