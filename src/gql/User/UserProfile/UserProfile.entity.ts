import {AfterLoad, Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {UserEntity} from "../User.entity";
import {CDNMapper} from "../../common/CDNMapper";
import {CachableEntityInterface} from "../../common/interfaces/Cachable.entity.interface";


@Entity()
export class UserProfileEntity extends CachableEntityInterface {

    @OneToOne(() => UserEntity, user => user.profile, {onDelete: "CASCADE"})
    @JoinColumn({name: "userId"})
    user: UserEntity;

    @PrimaryColumn()
    userId: string;

    @Column({length: 10000, nullable: true})
    bio?: string;

    @Column("char", {length: 6, nullable: true})
    color?: string;

    @Column("bytea", {nullable: true})
    avatarFile?: string;

    @Column("bytea", {nullable: true})
    bannerFile?: string;

    avatarUrl: string;
    bannerUrl: string;

    @AfterLoad()
    afterLoad() {
        if (!!this.avatarFile) {
            this.avatarUrl = CDNMapper.users.avatar(this.userId, "webp", this.cacheUUID);
        }
        if (!!this.bannerFile) {
            this.bannerUrl = CDNMapper.users.banner(this.userId, "webp", this.cacheUUID);
        }
    }

}

