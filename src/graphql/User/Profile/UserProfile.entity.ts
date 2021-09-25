import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {UserEntity} from "../User.entity";
import {CDNMapper} from "../../common/CDNMapper";
import {CachableEntityInterface} from "../../common/interfaces/Cachable.entity.interface";


@Entity("user_profile")
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

    get avatarUrl(): string {
        return !!this.avatarFile ? CDNMapper.users.avatar(this.userId, "webp", this.cacheId) : null;
    };

    get bannerUrl(): string {
        return !!this.bannerFile ? CDNMapper.users.banner(this.userId, "webp", this.cacheId) : null;
    }

}

