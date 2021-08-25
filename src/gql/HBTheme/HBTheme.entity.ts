import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne} from "typeorm";
import {ThemeTagEntity} from "../ThemeTag/ThemeTag.entity";
import {HBThemePreviewsEntity} from "./HBThemePreviews/HBThemePreviews.entity";
import {HBThemeAssetsEntity} from "./HBThemeAssets/HBThemeAssets.entity";
import {PackEntity} from "../Pack/Pack.entity";
import {ItemEntityInterface} from "../common/interfaces/Item.entity.interface";


@Entity()
export class HBThemeEntity extends ItemEntityInterface {

    @JoinColumn()
    @ManyToOne(() => PackEntity, {onDelete: "CASCADE", eager: true})
    pack: PackEntity;

    @Column()
    isNSFW: boolean;

    @ManyToMany(() => ThemeTagEntity, {onDelete: "CASCADE", cascade: true})
    @JoinTable()
    tags: ThemeTagEntity[];

    @OneToOne(() => HBThemePreviewsEntity, hbThemePreviews => hbThemePreviews.hbTheme, {cascade: true, eager: true})
    previews: HBThemePreviewsEntity;

    @OneToOne(() => HBThemeAssetsEntity, hbThemeAssets => hbThemeAssets.hbTheme, {cascade: true, eager: true})
    assets: HBThemeAssetsEntity;

}