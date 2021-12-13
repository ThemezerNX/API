import {AfterLoad, Entity, ManyToOne, OneToOne} from "typeorm";
import {HBThemePreviewsEntity} from "./Previews/HBThemePreviews.entity";
import {HBThemeAssetsEntity} from "./Assets/HBThemeAssets.entity";
import {PackEntity} from "../Pack/Pack.entity";
import {CDNMapper} from "../common/CDNMapper";
import {EntityWithPreviewsInterface} from "../common/interfaces/EntityWithPreviews.interface";
import {EntityWithAssetsInterface} from "../common/interfaces/EntityWithAssets.interface";
import {ThemeItemEntityInterface} from "../common/interfaces/ThemeItem.entity.interface";


@Entity()
export class HBThemeEntity extends ThemeItemEntityInterface implements EntityWithPreviewsInterface, EntityWithAssetsInterface {

    @ManyToOne(() => PackEntity, pack => pack.hbthemes, {onDelete: "CASCADE"})
    pack?: PackEntity;

    @OneToOne(() => HBThemePreviewsEntity, hbthemePreviews => hbthemePreviews.hbtheme, {cascade: true, eager: true})
    previews: HBThemePreviewsEntity;

    @OneToOne(() => HBThemeAssetsEntity, hbthemeAssets => hbthemeAssets.hbtheme, {cascade: true, eager: true})
    assets: HBThemeAssetsEntity;

    @AfterLoad()
    setUrls() {
        this.downloadUrl = CDNMapper.hbthemes.download(this.id);
    }

}