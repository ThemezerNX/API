import {BaseEntity, Column, CreateDateColumn, Entity, Generated, OneToOne, PrimaryColumn} from "typeorm";
import {Field, ID, ObjectType} from "type-graphql";
import {UserPreferences} from "./UserPreferences";
import {UserConnections} from "./UserConnections";
import {UserProfile} from "./UserProfile";
import {IsEmail} from "class-validator";
import {EmailAddressResolver} from "graphql-scalars";


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

    @Field(() => EmailAddressResolver, {nullable: true})
    @IsEmail()
    @Column({unique: true, nullable: true})
    email?: string;

    @Field()
    @Column({length: 32})
    username: string;

    @Field()
    @CreateDateColumn({type: "timestamp"})
    joinedTimestamp: Date;

    @Field()
    @Column({default: false})
    hasAccepted: boolean;

    @Field()
    @Column({default: false})
    isAdmin: boolean;

    @Field()
    @Column({default: false})
    isBlocked: boolean;

    @Field(() => [String])
    @Column("varchar", {array: true, default: []})
    roles: string[];

    @Field(() => UserProfile)
    @OneToOne(() => UserProfile, profile => profile.user, {cascade: true, eager: true})
    profile: UserProfile;

    @Field(() => UserPreferences)
    @OneToOne(() => UserPreferences, preferences => preferences.user, {cascade: true, eager: true})
    preferences: UserPreferences;

    @Field(() => UserConnections)
    @OneToOne(() => UserConnections, connections => connections.user, {cascade: true, eager: true})
    connections: UserConnections;

}