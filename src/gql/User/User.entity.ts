import {BaseEntity, Column, CreateDateColumn, Entity, Generated, OneToOne, PrimaryColumn} from "typeorm";
import {UserPreferencesEntity} from "./UserPreferences/UserPreferences.entity";
import {UserConnectionsEntity} from "./UserConnections/UserConnections.entity";
import {UserProfileEntity} from "./UserProfile/UserProfile.entity";


@Entity()
export class UserEntity extends BaseEntity {

    @Column("int", {select: false})
    @Generated("increment")
    counter: number;

    @PrimaryColumn({
        type: "varchar",
        generatedType: "STORED",
        update: false,
        asExpression: "lpad(('x' || substr(md5(counter::VARCHAR), 1, 16))::BIT(63)::BIGINT::VARCHAR, 19, '0'))",
    })
    id: string;

    @Column({unique: true, nullable: true})
    email?: string;

    @Column({length: 32})
    username: string;

    @CreateDateColumn({type: "timestamp"})
    joinedTimestamp: Date;

    @Column({default: false})
    hasAccepted: boolean;

    @Column({default: false})
    isAdmin: boolean;

    @Column({default: false})
    isBlocked: boolean;

    @Column("varchar", {array: true, default: []})
    roles: string[];

    @OneToOne(() => UserProfileEntity, profile => profile.user, {cascade: true, eager: true})
    profile: UserProfileEntity;

    @OneToOne(() => UserPreferencesEntity, preferences => preferences.user, {cascade: true, eager: true})
    preferences: UserPreferencesEntity;

    @OneToOne(() => UserConnectionsEntity, connections => connections.user, {cascade: true, eager: true})
    connections: UserConnectionsEntity;

}