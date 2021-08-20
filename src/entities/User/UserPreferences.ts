import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {User} from "./User";


@ObjectType()
@Entity()
export class UserPreferences {

    @OneToOne(() => User, {primary: true, onDelete: "CASCADE", cascade: true})
    @JoinColumn()
    user: User;

    @Field()
    @Column()
    showNSFW: boolean;

}