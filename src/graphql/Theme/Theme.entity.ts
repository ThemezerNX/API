import {AfterLoad, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {Target} from "../common/enums/Target";
import {ThemePreviewsEntity} from "./Previews/ThemePreviews.entity";
import {ThemeAssetsEntity} from "./Assets/ThemeAssets.entity";
import {PackEntity} from "../Pack/Pack.entity";
import {LayoutEntity} from "../Layout/Layout.entity";
import {CDNMapper} from "../common/CDNMapper";
import {EntityWithPreviewsInterface} from "../common/interfaces/EntityWithPreviews.interface";
import {EntityWithAssetsInterface} from "../common/interfaces/EntityWithAssets.interface";
import {ThemeOptionEntity} from "./ThemeOptions/ThemeOption.entity";
import {ThemeItemEntityInterface} from "../common/interfaces/ThemeItem.entity.interface";
import {WebsiteMappings} from "../common/WebsiteMappings";


@Entity()
export class ThemeEntity extends ThemeItemEntityInterface implements EntityWithPreviewsInterface, EntityWithAssetsInterface {

    @ManyToOne(() => PackEntity, pack => pack.themes, {onDelete: "CASCADE"})
    pack?: PackEntity;

    @Column({
        type: "enum",
        enum: Target,
        onUpdate: "CASCADE",
    })
    target: Target;

    @ManyToOne(() => LayoutEntity, {onDelete: "RESTRICT"})
    @JoinColumn({name: "layoutId"})
    layout?: LayoutEntity;

    @Column({nullable: true})
    layoutId?: string;

    @OneToOne(() => ThemePreviewsEntity, themePreviews => themePreviews.theme, {cascade: true, eager: true})
    previews: ThemePreviewsEntity;

    @OneToOne(() => ThemeAssetsEntity, themeAssets => themeAssets.theme, {cascade: true, eager: true})
    assets: ThemeAssetsEntity;

    @OneToMany(() => ThemeOptionEntity, themeOptions => themeOptions.theme, {cascade: true, eager: true})
    options: ThemeOptionEntity[];

    @AfterLoad()
    setUrls() {
        this.downloadUrl = CDNMapper.themes.download(this.id);
        this.pageUrl = WebsiteMappings.theme(this.id, this.name);
    }

}