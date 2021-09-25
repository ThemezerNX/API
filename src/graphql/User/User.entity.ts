import {Column, CreateDateColumn, Entity, Generated, OneToOne, PrimaryColumn} from "typeorm";
import {UserPreferencesEntity} from "./Preferences/UserPreferences.entity";
import {UserConnectionsEntity} from "./Connections/UserConnections.entity";
import {UserProfileEntity} from "./Profile/UserProfile.entity";
import {CachableEntityInterface} from "../common/interfaces/Cachable.entity.interface";


@Entity("user")
export class UserEntity extends CachableEntityInterface {

    @Column({type: "int", select: false, update: false})
    @Generated("increment")
    readonly counter: number;

    @PrimaryColumn("char", {
        length: 19,
        default: () => `
            lpad(
                        ('x' || substr(md5((lastval())::VARCHAR), 1, 16))
                            ::BIT(63)::BIGINT::VARCHAR,
                        19,
                        '0'
                    )
        `,
        update: false,
    })
    id: string;

    @Column({unique: true, nullable: true})
    email?: string;

    @Column({length: 32})
    username: string;

    @Column({nullable: true})
    password?: string;

    @Column({
        type: "char",
        length: 32,
        default: () => "md5(random()::text)",
        update: false,
    })
    verificationToken: string;

    @Column({default: false})
    isVerified: boolean = false;

    @CreateDateColumn({type: "timestamp", update: false})
    joinedTimestamp: Date;

    @Column({default: false})
    hasAccepted: boolean = false;

    @Column({default: false})
    isAdmin: boolean = false;

    @Column({default: false})
    isBlocked: boolean = false;

    @Column("varchar", {array: true, default: []})
    roles: string[] = [];

    @OneToOne(() => UserProfileEntity, profile => profile.user, {cascade: true, eager: true})
    profile: UserProfileEntity;

    @OneToOne(() => UserPreferencesEntity, preferences => preferences.user, {cascade: true, eager: true})
    preferences: UserPreferencesEntity;

    @OneToOne(() => UserConnectionsEntity, connections => connections.user, {cascade: true, eager: true})
    connections: UserConnectionsEntity;

}