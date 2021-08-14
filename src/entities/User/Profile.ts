import {Column, Entity, Generated, JoinColumn, OneToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {IsHexColor} from "class-validator";
import {User} from "./index";


@ObjectType()
@Entity()
export class UserProfile {

    @OneToOne(() => User, {primary: true, onDelete: "CASCADE", cascade: true})
    @JoinColumn()
    user: User;

    @Field()
    @Column({length: 10000})
    bio: string;

    @Column("bytea")
    avatarFile: string;

    @Field(() => [String])
    avatarUrl: string;

    @Column("bytea")
    bannerFile: string;

    @Field(() => [String])
    bannerUrl: string;

    @Field()
    @IsHexColor()
    @Column("char", {length: 6})
    color: string;

    @Column("uuid", {unique: true, nullable: false})
    @Generated("uuid")
    randomUuid: string;

}