import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {Item} from "../Item";
import {Target} from "../Target";
import {HexColorCode, JSON, URL, UUID} from "graphql-scalars/mocks";
import {User} from "../User/User";


@ObjectType()
@Entity()
export class Layout extends Item {

    @Field(() => UUID)
    @Column("uuid", {unique: true, nullable: false})
    uuid: string;

    @Field()
    @JoinColumn()
    @ManyToOne(() => User, {onDelete: "SET NULL"})
    creator: User;

    @Field(() => Target)
    @Column({
        type: "enum",
        enum: Target,
        nullable: false,
    })
    target: Target;

    @Field(() => HexColorCode)
    @Column("char", {length: 6})
    color: string;

    @Field(() => JSON)
    @Column("jsonb")
    json: string;

    @Field(() => JSON)
    @Column("jsonb")
    commonJson: string;

    @Field(() => URL)
    overlayUrl: string;

    @Column("bytea", {nullable: false})
    overlayFile: string;

}