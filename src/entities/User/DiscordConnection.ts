import {BaseEntity, Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {User} from "./User";


@ObjectType()
@Entity()
export class DiscordConnection extends BaseEntity {

    @OneToOne(() => User, {primary: true, onDelete: "CASCADE", cascade: true})
    @JoinColumn()
    user: User;

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