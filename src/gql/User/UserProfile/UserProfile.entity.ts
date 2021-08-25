import {
    AfterLoad,
    BaseEntity,
    BeforeUpdate,
    Column,
    Entity,
    Generated,
    JoinColumn,
    OneToOne,
    PrimaryColumn,
} from "typeorm";
import {v4 as uuid} from "uuid";
import {UserEntity} from "../User.entity";


@Entity()
export class UserProfileEntity extends BaseEntity {

    @OneToOne(() => UserEntity, user => user.profile, {onDelete: "CASCADE"})
    @JoinColumn({name: "userId"})
    user: UserEntity;

    @PrimaryColumn()
    userId: string;

    @Column({length: 10000, nullable: true})
    bio?: string;

    @Column("char", {length: 6, nullable: true})
    color?: string;

    @Column("uuid", {unique: true})
    @Generated("uuid")
    randomUuid: string;

    @Column("bytea", {nullable: true})
    avatarFile?: string;

    @Column("bytea", {nullable: true})
    bannerFile?: string;

    avatarUrl: string;
    bannerUrl: string;

    @AfterLoad()
    afterLoad() {
        if (!!this.avatarFile) {
            this.avatarUrl = `https://cdn.themezer.net/creators/${this.userId}/avatar?${this.randomUuid}`;
        }
        if (!!this.bannerFile) {
            this.bannerUrl = `https://cdn.themezer.net/creators/${this.userId}/banner?${this.randomUuid}`;
        }
    }

    @BeforeUpdate()
    randomizeUuid() {
        this.randomUuid = uuid();
    }

}

