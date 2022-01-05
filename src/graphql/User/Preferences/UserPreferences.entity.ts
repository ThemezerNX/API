import {BaseEntity, Column, DeepPartial, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {UserEntity} from "../User.entity";


@Entity()
export class UserPreferencesEntity extends BaseEntity {

    constructor(entityLike?: DeepPartial<UserPreferencesEntity>) {
        super();
        Object.assign(this, entityLike);
    }

    @JoinColumn({name: "userId"})
    @OneToOne(() => UserEntity, user => user.preferences, {primary: true, onDelete: "CASCADE"})
    user: UserEntity;

    @PrimaryColumn("varchar", {length: 19})
    userId: string;

    @Column({default: false})
    showNSFW: boolean;

    @Column({default: true})
    notificationEmails: boolean;

    @Column({default: true})
    promotionEmails: boolean;

}