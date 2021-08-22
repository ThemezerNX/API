import {Column, Entity, JoinColumn, ManyToMany, ManyToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {Item} from "../Item";
import {Target} from "../Target";
import {UUID} from "graphql-scalars/mocks";
import {Pack} from "../Pack/Pack";
import {Layout} from "../Layout/Layout";
import {ThemeTag} from "./ThemeTag";
import {ThemePreviews} from "./ThemePreviews";
import {HBThemePreviews} from "./HBThemePreviews";


@ObjectType()
@Entity()
export class HBTheme extends Item {

    @Field()
    @JoinColumn()
    @ManyToOne(() => Pack, {onDelete: "CASCADE"})
    pack: Pack;

    @Field()
    @Column()
    isNSFW: boolean;

    @Field()
    @JoinColumn()
    @ManyToOne(() => HBLayout, {onDelete: "RESTRICT"})
    layout: HBLayout;

    @Field(() => [ThemeTag])
    @JoinColumn()
    @ManyToMany(() => ThemeTag, {onDelete: "CASCADE"})
    tags: ThemeTag[];

    @Field(() => HBThemePreviews)
    @JoinColumn()
    previews: HBThemePreviews

    @Field(() => HBThemeAssets)
    @JoinColumn()
    assets: HBThemeAssets

}