import {AfterLoad, Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {UserEntity} from "../User.entity";
import {CDNMapper} from "../../common/CDNMapper";
import {CachableEntityInterface} from "../../common/interfaces/Cachable.entity.interface";


@Entity()
export class UserProfileEntity extends CachableEntityInterface {

    @OneToOne(() => UserEntity, user => user.profile, {onDelete: "CASCADE"})
    @JoinColumn({name: "userId"})
    user: UserEntity;

    @PrimaryColumn("char", {length: 19})
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
    avatarHash?: Buffer;
    @Column("bytea", {nullable: true})
    bannerHash?: Buffer;

    avatarUrl: string;
    bannerUrl: string;

    @AfterLoad()
    setUrls() {
        this.avatarUrl = !!this.avatarHash ? CDNMapper.users.avatar(this.userId, "webp", this.avatarHash) : null;
        this.bannerUrl = !!this.bannerHash ? CDNMapper.users.banner(this.userId, "webp", this.bannerHash) : null;
    }

}

