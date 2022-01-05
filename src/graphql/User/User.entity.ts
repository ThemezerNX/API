import {AfterLoad, Column, CreateDateColumn, Entity, Generated, OneToOne, PrimaryColumn} from "typeorm";
import {UserPreferencesEntity} from "./Preferences/UserPreferences.entity";
import {UserConnectionsEntity} from "./Connections/UserConnections.entity";
import {UserProfileEntity} from "./Profile/UserProfile.entity";
import {CachableEntityInterface} from "../common/interfaces/Cachable.entity.interface";
import {WebsiteMappings} from "../common/WebsiteMappings";


@Entity()
export class UserEntity extends CachableEntityInterface {

    @Column({type: "int", select: false, update: false, unique: true})
    @Generated("increment")
    counter: number;

    // special case here: if a counter number is < 1, the ID is simply the number, but positive. E.g. -5 > 5, 0 > 0
    @PrimaryColumn("varchar", {
        length: 19,
        generatedType: "STORED",
        asExpression: `
            CASE WHEN counter < 1 THEN (-(counter))::varchar ELSE lpad(
                ('x' || substr(md5((counter)::VARCHAR), 1, 16))::BIT(63)::BIGINT::VARCHAR,
                19,
                '0'
            ) END
        `,
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

    @Column({
        type: "char",
        length: 32,
        default: () => "md5(random()::text)",
        update: false,
    })
    csrfToken: string;

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

    @OneToOne(() => UserProfileEntity, profile => profile.user, {eager: true, cascade: true})
    profile: UserProfileEntity;

    @OneToOne(() => UserPreferencesEntity, preferences => preferences.user, {eager: true, cascade: true})
    preferences: UserPreferencesEntity;

    @OneToOne(() => UserConnectionsEntity, connections => connections.user, {eager: true, cascade: true})
    connections: UserConnectionsEntity;

    pageUrl: string;

    @AfterLoad()
    setUrls() {
        this.pageUrl = WebsiteMappings.user(this.id);
    }

    toJSON() {
        delete this.password;
        delete this.csrfToken;
        return this;
    }

}