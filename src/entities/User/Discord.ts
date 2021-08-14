import {BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {User} from "./index";


@ObjectType()
@Entity()
export class DiscordConnection extends BaseEntity {

    @OneToOne(() => User, {primary: true, onDelete: "CASCADE", cascade: true})
    @JoinColumn()
    user: User;

    @Field()
    @Column({nullable: false})
    username: string;

    @Field()
    @Column("int", {nullable: false})
    discriminator: number;

    @Field()
    @Column({nullable: false})
    avatarHash: string;

}