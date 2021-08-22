import {Column, Entity, JoinColumn, ManyToMany, ManyToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {Item} from "../Item";
import {Pack} from "../Pack/Pack";
import {ThemeTag} from "./ThemeTag";
import {HBThemePreviews} from "./HBThemePreviews";
import {HBThemeAssets} from "./HBThemeAssets";


@ObjectType()
@Entity()
export class HBTheme extends Item {

    @Field(() => Pack)
    @JoinColumn()
    @ManyToOne(() => Pack, {onDelete: "CASCADE"})
    pack: Pack;

    @Field()
    @Column()
    isNSFW: boolean;

    @Field(() => [ThemeTag])
    @JoinColumn()
    @ManyToMany(() => ThemeTag, {onDelete: "CASCADE", cascade: true})
    tags: ThemeTag[];

    @Field(() => HBThemePreviews)
    @JoinColumn()
    previews: HBThemePreviews;

    @Field(() => HBThemeAssets)
    @JoinColumn()
    assets: HBThemeAssets;

}