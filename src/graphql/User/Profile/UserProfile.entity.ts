import {AfterLoad, Column, DeepPartial, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {UserEntity} from "../User.entity";
import {CDNMapper} from "../../common/CDNMapper";
import {CachableEntityInterface} from "../../common/interfaces/Cachable.entity.interface";
import {SelectAlways} from "perch-query-builder";


@Entity()
export class UserProfileEntity extends CachableEntityInterface {

    constructor(entityLike?: DeepPartial<UserProfileEntity>) {
        super();
        Object.assign(this, entityLike);
    }

    @OneToOne(() => UserEntity, user => user.profile, {onDelete: "CASCADE"})
    @JoinColumn({name: "userId"})
    user: UserEntity;

    @PrimaryColumn("varchar", {length: 19})
    userId: string;

    @Column({length: 10000, nullable: true})
    bio?: string;

    @Column("char", {length: 6, nullable: true})
    color?: string;

    @Column("bytea", {nullable: true})
    avatarFile?: Buffer;
    @Column("bytea", {nullable: true})
    bannerFile?: Buffer;

    @Column("bytea", {nullable: true})
    @SelectAlways()
    avatarHash?: Buffer;
    @Column("bytea", {nullable: true})
    @SelectAlways()
    bannerHash?: Buffer;

    avatarUrl: string;
    bannerUrl: string;

    @AfterLoad()
    setUrls() {
        this.avatarUrl = !!this.avatarHash ? CDNMapper.users.avatar(this.userId, "webp", this.avatarHash) : null;
        this.bannerUrl = !!this.bannerHash ? CDNMapper.users.banner(this.userId, "webp", this.bannerHash) : null;
    }

}

