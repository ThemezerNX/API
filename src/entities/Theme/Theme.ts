import {Column, Entity, JoinColumn, ManyToMany, ManyToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {Item} from "../Item";
import {Target} from "../Target";
import {Pack} from "../Pack/Pack";
import {Layout} from "../Layout/Layout";
import {ThemeTag} from "./ThemeTag";
import {ThemePreviews} from "./ThemePreviews";
import {ThemeAssets} from "./ThemeAssets";


@ObjectType()
@Entity()
export class Theme extends Item {

    @Field(() => Pack)
    @JoinColumn()
    @ManyToOne(() => Pack, {onDelete: "CASCADE"})
    pack?: Pack;

    @Field(() => Target)
    @Column({
        type: "enum",
        enum: Target,
        onUpdate: "CASCADE",
    })
    target: Target;

    @Field()
    @Column()
    isNSFW: boolean;

    @Field()
    @JoinColumn()
    @ManyToOne(() => Layout, {onDelete: "RESTRICT"})
    layout?: Layout;

    @Field(() => [ThemeTag])
    @JoinColumn()
    @ManyToMany(() => ThemeTag, {onDelete: "CASCADE", cascade: true})
    tags: ThemeTag[];

    @Field(() => ThemePreviews)
    @JoinColumn()
    previews: ThemePreviews;

    @Field(() => ThemeAssets)
    @JoinColumn()
    assets: ThemeAssets;

}