import {Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {UserConnections} from "./UserConnections";


@ObjectType()
@Entity()
export class DiscordConnection {

    @OneToOne(() => UserConnections,
        connections => connections.discord,
        {primary: true, onDelete: "CASCADE"})
    @JoinColumn()
    userConnections: UserConnections;

    @Field()
    @Column()
    username: string;

    @Field()
    @Column("int")
    discriminator: number;

    @Field()
    @Column()
    avatarHash: string;

}