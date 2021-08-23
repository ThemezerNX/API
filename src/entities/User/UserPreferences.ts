import {Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {User} from "./User";


@ObjectType()
@Entity()
export class UserPreferences {

    @OneToOne(() => User, {primary: true, onDelete: "CASCADE", cascade: true})
    @JoinColumn()
    user: User;

    @Field()
    @Column({default: false})
    showNSFW: boolean;

    @Field()
    @Column({default: true})
    popularEmails: boolean;

    @Field()
    @Column({default: true})
    promotionEmails: boolean;

}