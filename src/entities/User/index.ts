import {BaseEntity, Column, CreateDateColumn, Entity, Generated, JoinColumn, PrimaryColumn} from "typeorm";
import {Field, ID, ObjectType} from "type-graphql";
import {UserPreferences} from "./Preferences";
import {UserConnections} from "./Connections";
import {UserProfile} from "./Profile";
import {IsEmail} from "class-validator";
import {EmailAddress} from "graphql-scalars/mocks";


@ObjectType()
@Entity()
export class User extends BaseEntity {

    @Column("int", {select: false})
    @Generated("increment")
    counter: number;

    @Field(() => ID)
    @PrimaryColumn({
        type: "varchar",
        generatedType: "STORED",
        update: false,
        asExpression: "lpad(('x' || substr(md5(counter::VARCHAR), 1, 16))::BIT(63)::BIGINT::VARCHAR, 19, '0'))",
    })
    id: string;

    @Field(() => EmailAddress)
    @IsEmail()
    @Column({unique: true})
    email: string;

    @Field()
    @Column({length: 32, nullable: false})
    username: string;

    @Field()
    @CreateDateColumn({type: "timestamp", nullable: false})
    joinedTimestamp: Date;

    @Field()
    @Column({nullable: false, default: false})
    hasAccepted: boolean;

    @Field()
    @Column({nullable: false, default: false})
    isAdmin: boolean;

    @Field()
    @Column({nullable: false, default: false})
    isBlocked: boolean;

    @Field(() => [String])
    @Column("varchar", {array: true, nullable: false, default: []})
    roles: string[];

    @Field(() => UserProfile)
    @JoinColumn()
    profile: UserProfile;

    @Field(() => UserPreferences)
    @JoinColumn()
    preferences: UserPreferences;

    @Field(() => UserConnections)
    @JoinColumn()
    connections: UserConnections;

}