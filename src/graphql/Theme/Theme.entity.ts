import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne} from "typeorm";
import {Target} from "../common/enums/Target";
import {ThemeTagEntity} from "../ThemeTag/ThemeTag.entity";
import {ThemePreviewsEntity} from "./Previews/ThemePreviews.entity";
import {ThemeAssetsEntity} from "./Assets/ThemeAssets.entity";
import {ItemEntityInterface} from "../common/interfaces/Item.entity.interface";
import {PackEntity} from "../Pack/Pack.entity";
import {LayoutEntity} from "../Layout/Layout.entity";
import {CDNMapper} from "../common/CDNMapper";
import {EntityWithPreviewsInterface} from "../common/interfaces/EntityWithPreviews.interface";
import {EntityWithAssetsInterface} from "../common/interfaces/EntityWithAssets.interface";


@Entity()
export class ThemeEntity extends ItemEntityInterface implements EntityWithPreviewsInterface, EntityWithAssetsInterface  {

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

    get options(): undefined {
        return undefined;
    }

    get downloadUrl(): string {
        return CDNMapper.themes.download(this.id);
    }

}