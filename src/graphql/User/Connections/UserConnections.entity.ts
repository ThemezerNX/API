import {BaseEntity, Column, DeepPartial, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {DiscordConnectionEntity} from "./DiscordConnection.entity";
import {UserEntity} from "../User.entity";

@Entity()
export class UserConnectionsEntity extends BaseEntity {

    constructor(entityLike?: DeepPartial<UserConnectionsEntity>) {
        super();
        Object.assign(this, entityLike);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @JoinColumn({name: "userId"})
    @OneToOne(() => UserEntity, user => user.connections, {onDelete: "CASCADE"})
    user: UserEntity;

    @Column("varchar", {length: 19})
    userId: string;

    @OneToOne(() => DiscordConnectionEntity,
        discordConnection => discordConnection.userConnections,
        {cascade: true, eager: true})
    discord?: DiscordConnectionEntity;

}

