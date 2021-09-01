import {
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    Generated,
    OneToOne,
    PrimaryColumn,
} from "typeorm";
import {UserPreferencesEntity} from "./UserPreferences/UserPreferences.entity";
import {UserConnectionsEntity} from "./UserConnections/UserConnections.entity";
import {UserProfileEntity} from "./UserProfile/UserProfile.entity";


@Entity()
export class UserEntity extends BaseEntity {

    @Column("int", {select: false})
    @Generated("increment")
    readonly counter: number;

    @PrimaryColumn({type: "varchar", length: 19})
    readonly id: string;

    @Column({unique: true, nullable: true})
    email?: string;

    @Column({length: 32})
    username: string;

    @Column({nullable: true})
    password?: string;

    @CreateDateColumn({type: "timestamp"})
    joinedTimestamp: Date;

    @Column({default: false})
    hasAccepted: boolean;

    @Column({default: false})
    isAdmin: boolean;

    @Column({default: false})
    isBlocked: boolean;

    @Column("varchar", {array: true})
    roles: string[] = [];

    @OneToOne(() => UserProfileEntity, profile => profile.user, {cascade: true, eager: true})
    profile: UserProfileEntity;

    @OneToOne(() => UserPreferencesEntity, preferences => preferences.user, {cascade: true, eager: true})
    preferences: UserPreferencesEntity;

    @OneToOne(() => UserConnectionsEntity, connections => connections.user, {cascade: true, eager: true})
    connections: UserConnectionsEntity;

}