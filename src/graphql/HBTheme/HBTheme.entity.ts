import {AfterLoad, Entity, ManyToOne, OneToOne} from "typeorm";
import {HBThemePreviewsEntity} from "./Previews/HBThemePreviews.entity";
import {HBThemeAssetsEntity} from "./Assets/HBThemeAssets.entity";
import {PackEntity} from "../Pack/Pack.entity";
import {CDNMapper} from "../common/CDNMapper";
import {EntityWithPreviewsInterface} from "../common/interfaces/EntityWithPreviews.interface";
import {EntityWithAssetsInterface} from "../common/interfaces/EntityWithAssets.interface";
import {ThemeItemEntityInterface} from "../common/interfaces/ThemeItem.entity.interface";
import {HBThemeLightColorSchemeEntity} from "./ColorScheme/HBThemeLightColorScheme.entity";
import {HBThemeDarkColorSchemeEntity} from "./ColorScheme/HBThemeDarkColorScheme.entity";
import {WebsiteMappings} from "../common/WebsiteMappings";


@Entity()
export class HBThemeEntity extends ThemeItemEntityInterface implements EntityWithPreviewsInterface, EntityWithAssetsInterface {

    @ManyToOne(() => PackEntity, pack => pack.hbthemes, {onDelete: "CASCADE"})
    pack?: PackEntity;

    @OneToOne(() => HBThemePreviewsEntity, hbthemePreviews => hbthemePreviews.hbtheme, {cascade: true, eager: true})
    previews: HBThemePreviewsEntity;

    @OneToOne(() => HBThemeAssetsEntity, hbthemeAssets => hbthemeAssets.hbtheme, {cascade: true, eager: true})
    assets: HBThemeAssetsEntity;

    @OneToOne(() => HBThemeLightColorSchemeEntity, hbthemeColorScheme => hbthemeColorScheme.hbtheme, {
        cascade: true,
        eager: true,
    })
    lightTheme: HBThemeLightColorSchemeEntity;

    @OneToOne(() => HBThemeDarkColorSchemeEntity, hbthemeColorScheme => hbthemeColorScheme.hbtheme, {
        cascade: true,
        eager: true,
    })
    darkTheme: HBThemeDarkColorSchemeEntity;

    @AfterLoad()
    setUrls() {
        this.downloadUrl = CDNMapper.hbthemes.download(this.id);
        this.pageUrl = WebsiteMappings.hbtheme(this.id);
    }

}