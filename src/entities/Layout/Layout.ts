import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {Item} from "../Item";
import {Target} from "../Target";
import {HexColorCodeResolver, UUIDResolver} from "graphql-scalars";
import {User} from "../User/User";
import {LayoutOption} from "./LayoutOption";


@ObjectType()
@Entity()
export class Layout extends Item {

    @Field(() => UUIDResolver)
    @Column("uuid", {unique: true})
    uuid: string;

    @Field()
    @JoinColumn()
    @ManyToOne(() => User, {onDelete: "SET NULL"})
    creator: User;

    @Field(() => Target)
    @Column({
        type: "enum",
        enum: Target,
    })
    target: Target;

    @Field(() => HexColorCodeResolver)
    @Column("char", {length: 6, nullable: true})
    color?: string;

    @Field(() => JSON)
    @Column("jsonb", {nullable: true})
    json?: string;

    @Field(() => JSON)
    @Column("jsonb", {nullable: true})
    commonJson?: string;

    @Field(() => [LayoutOption])
    @JoinColumn()
    options: LayoutOption[];

}