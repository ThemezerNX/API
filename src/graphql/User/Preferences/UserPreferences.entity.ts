import {BaseEntity, Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {UserEntity} from "../User.entity";


@Entity("user_preferences")
export class UserPreferencesEntity extends BaseEntity {

    @OneToOne(() => UserEntity, user => user.preferences, {primary: true, onDelete: "CASCADE"})
    @JoinColumn()
    user: UserEntity;

    @Column({default: false})
    showNSFW: boolean;

    @Column({default: true})
    messages: boolean;

    @Column({default: true})
    popularEmails: boolean;

    @Column({default: true})
    promotionEmails: boolean;

}