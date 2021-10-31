import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne} from "typeorm";
import {ThemeTagEntity} from "../ThemeTag/ThemeTag.entity";
import {HBThemePreviewsEntity} from "./Previews/HBThemePreviews.entity";
import {HBThemeAssetsEntity} from "./Assets/HBThemeAssets.entity";
import {PackEntity} from "../Pack/Pack.entity";
import {ItemEntityInterface} from "../common/interfaces/Item.entity.interface";
import {CDNMapper} from "../common/CDNMapper";
import {EntityWithPreviewsInterface} from "../common/interfaces/EntityWithPreviews.interface";
import {EntityWithAssetsInterface} from "../common/interfaces/EntityWithAssets.interface";


@Entity()
export class HBThemeEntity extends ItemEntityInterface implements EntityWithPreviewsInterface, EntityWithAssetsInterface {

    @ManyToOne(() => PackEntity, pack => pack.hbthemes, {onDelete: "CASCADE"})
    @JoinColumn({name: "packId"})
    pack?: PackEntity;

    @Column({nullable: true})
    packId?: string;

    @Column()
    isNSFW: boolean;

    @ManyToMany(() => ThemeTagEntity, {onDelete: "CASCADE", cascade: true, eager: true})
    @JoinTable()
    tags: ThemeTagEntity[];

    @OneToOne(() => HBThemePreviewsEntity, hbthemePreviews => hbthemePreviews.hbtheme, {cascade: true, eager: true})
    previews: HBThemePreviewsEntity;

    @OneToOne(() => HBThemeAssetsEntity, hbthemeAssets => hbthemeAssets.hbtheme, {cascade: true, eager: true})
    assets: HBThemeAssetsEntity;

    get downloadUrl(): string {
        return CDNMapper.hbthemes.download(this.id);
    }

}