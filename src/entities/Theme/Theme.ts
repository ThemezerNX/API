import {Column, Entity, JoinColumn, ManyToMany, ManyToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {Item} from "../Item";
import {Target} from "../Target";
import {UUID} from "graphql-scalars/mocks";
import {Pack} from "../Pack/Pack";
import {Layout} from "../Layout/Layout";
import {ThemeTag} from "./ThemeTag";


@ObjectType()
@Entity()
export class Theme extends Item {

    @Field(() => UUID)
    @Column("uuid", {unique: true, nullable: false})
    uuid: string;

    @Field()
    @JoinColumn()
    @ManyToOne(() => Pack, {onDelete: "CASCADE"})
    pack: Pack;

    @Field(() => Target)
    @Column({
        type: "enum",
        enum: Target,
        nullable: false,
        onUpdate: "CASCADE",
    })
    target: Target;

    @Field()
    @Column()
    isNSFW: boolean;

    @Field()
    @JoinColumn()
    @ManyToOne(() => Layout, {onDelete: "RESTRICT"})
    layout: Layout;

    @Field(() => [ThemeTag])
    @JoinColumn()
    @ManyToMany(() => ThemeTag, {onDelete: "CASCADE"})
    tags: ThemeTag[];

    previews: ThemePreviews

    assets: ThemeAssets

}