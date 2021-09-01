import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne} from "typeorm";
import {Target} from "../common/enums/Target";
import {ThemeTagEntity} from "../ThemeTag/ThemeTag.entity";
import {ThemePreviewsEntity} from "./ThemePreviews/ThemePreviews.entity";
import {ThemeAssetsEntity} from "./ThemeAssets/ThemeAssets.entity";
import {ItemEntityInterface} from "../common/interfaces/Item.entity.interface";
import {PackEntity} from "../Pack/Pack.entity";
import {LayoutEntity} from "../Layout/Layout.entity";


@Entity()
export class ThemeEntity extends ItemEntityInterface {

    @ManyToOne(() => PackEntity, pack => pack.themes, {onDelete: "CASCADE"})
    @JoinColumn({name: "packId"})
    pack?: PackEntity;

    @Column({nullable: true})
    packId?: string;

    @Column({
        type: "enum",
        enum: Target,
        onUpdate: "CASCADE",
    })
    target: Target;

    @Column()
    isNSFW: boolean;

    @ManyToOne(() => LayoutEntity, {onDelete: "RESTRICT"})
    @JoinColumn({name: "layoutId"})
    layout?: LayoutEntity;

    @Column({nullable: true})
    layoutId?: string;

    @ManyToMany(() => ThemeTagEntity, {onDelete: "CASCADE", cascade: true, eager: true})
    @JoinTable()
    tags: ThemeTagEntity[];

    @OneToOne(() => ThemePreviewsEntity, themePreviews => themePreviews.theme, {cascade: true, eager: true})
    previews: ThemePreviewsEntity;

    @OneToOne(() => ThemeAssetsEntity, themeAssets => themeAssets.theme, {cascade: true, eager: true})
    assets: ThemeAssetsEntity;

}