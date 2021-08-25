import {Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {UserEntity} from "../User.entity";


@Entity()
export class UserPreferencesEntity {

    @OneToOne(() => UserEntity, user => user.preferences, {primary: true, onDelete: "CASCADE"})
    @JoinColumn()
    user: UserEntity;

    @Column({default: false})
    showNSFW: boolean;

    @Column({default: true})
    popularEmails: boolean;

    @Column({default: true})
    promotionEmails: boolean;

}