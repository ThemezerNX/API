import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {Item} from "../Item";
import {Target} from "../Target";
import {HexColorCodeResolver, JSONResolver, UUIDResolver} from "graphql-scalars";
import {User} from "../User/User";
import {LayoutOption} from "./LayoutOption";


@ObjectType()
@Entity()
export class Layout extends Item {

    @Field(() => UUIDResolver)
    @Column("uuid", {unique: true})
    uuid: string;

    @Field()
    @ManyToOne(() => User, {onDelete: "SET NULL"})
    @JoinColumn()
    creator: User;

    @Field(() => Target)
    @Column({
        type: "enum",
        enum: Target,
    })
    target: Target;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @Column("char", {length: 6, nullable: true})
    color?: string;

    @Field(() => JSONResolver, {nullable: true})
    @Column("jsonb", {nullable: true})
    json?: string;

    @Field(() => JSONResolver, {nullable: true})
    @Column("jsonb", {nullable: true})
    commonJson?: string;

    @Field(() => [LayoutOption])
    @JoinColumn()
    options: LayoutOption[];

}