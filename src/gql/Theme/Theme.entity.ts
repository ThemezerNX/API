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

    @JoinColumn()
    @ManyToOne(() => PackEntity, {onDelete: "CASCADE", eager: true})
    pack?: PackEntity;

    @Column({
        type: "enum",
        enum: Target,
        onUpdate: "CASCADE",
    })
    target: Target;

    @Column()
    isNSFW: boolean;

    @JoinColumn()
    @ManyToOne(() => LayoutEntity, {onDelete: "RESTRICT"})
    layout?: LayoutEntity;

    @ManyToMany(() => ThemeTagEntity, {onDelete: "CASCADE", cascade: true})
    @JoinTable()
    tags: ThemeTagEntity[];

    @OneToOne(() => ThemePreviewsEntity, themePreviews => themePreviews.theme, {cascade: true, eager: true})
    previews: ThemePreviewsEntity;

    @OneToOne(() => ThemeAssetsEntity, themeAssets => themeAssets.theme, {cascade: true, eager: true})
    assets: ThemeAssetsEntity;

}