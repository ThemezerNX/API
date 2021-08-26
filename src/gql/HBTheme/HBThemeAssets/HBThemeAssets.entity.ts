import {AfterLoad, Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {HBThemeEntity} from "../HBTheme.entity";
import {CachableEntityInterface} from "../../common/interfaces/Cachable.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";

@Entity()
export class HBThemeAssetsEntity extends CachableEntityInterface {

    @OneToOne(() => HBThemeEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "hbThemeId"})
    hbTheme: HBThemeEntity;

    @PrimaryColumn()
    hbThemeId: string;

    @Column("bytea")
    batteryIconFile: any;
    @Column("bytea")
    chargingIconFile: any;
    @Column("bytea")
    folderIconFile: any;
    @Column("bytea")
    invalidIconFile: any;
    @Column("bytea")
    themeIconDarkFile: any;
    @Column("bytea")
    themeIconLightFile: any;
    @Column("bytea")
    airplaneIconFile: any;
    @Column("bytea")
    wifiNoneIconFile: any;
    @Column("bytea")
    wifi1IconFile: any;
    @Column("bytea")
    wifi2IconFile: any;
    @Column("bytea")
    wifi3IconFile: any;
    @Column("bytea")
    ethIconFile: any;
    @Column("bytea")
    backgroundImageFile: any;

    batteryIconUrl: string;
    chargingIconUrl: string;
    folderIconUrl: string;
    invalidIconUrl: string;
    themeIconDarkUrl: string;
    themeIconLightUrl: string;
    airplaneIconUrl: string;
    wifiNoneIconUrl: string;
    wifi1IconUrl: string;
    wifi2IconUrl: string;
    wifi3IconUrl: string;
    ethIconUrl: string;
    backgroundImageUrl: string;

    @AfterLoad()
    afterLoad() {
        if (!!this.batteryIconFile) {
            this.batteryIconUrl = CDNMapper.hbThemes.assets(this.hbThemeId, "batteryIcon", "png", this.cacheUUID);
        }
        if (!!this.chargingIconFile) {
            this.chargingIconUrl = CDNMapper.hbThemes.assets(this.hbThemeId, "chargingIcon", "png", this.cacheUUID);
        }
        if (!!this.folderIconFile) {
            this.folderIconUrl = CDNMapper.hbThemes.assets(this.hbThemeId, "folderIcon", "png", this.cacheUUID);
        }
        if (!!this.invalidIconFile) {
            this.invalidIconUrl = CDNMapper.hbThemes.assets(this.hbThemeId, "invalidIcon", "png", this.cacheUUID);
        }
        if (!!this.themeIconDarkFile) {
            this.themeIconDarkUrl = CDNMapper.hbThemes.assets(this.hbThemeId, "themeIconDark", "png", this.cacheUUID);
        }
        if (!!this.themeIconLightFile) {
            this.themeIconLightUrl = CDNMapper.hbThemes.assets(this.hbThemeId, "themeIconLight", "png", this.cacheUUID);
        }
        if (!!this.airplaneIconFile) {
            this.airplaneIconUrl = CDNMapper.hbThemes.assets(this.hbThemeId, "airplaneIcon", "png", this.cacheUUID);
        }
        if (!!this.wifiNoneIconFile) {
            this.wifiNoneIconUrl = CDNMapper.hbThemes.assets(this.hbThemeId, "wifiNoneIcon", "png", this.cacheUUID);
        }
        if (!!this.wifi1IconFile) {
            this.wifi1IconUrl = CDNMapper.hbThemes.assets(this.hbThemeId, "wifi1Icon", "png", this.cacheUUID);
        }
        if (!!this.wifi2IconFile) {
            this.wifi2IconUrl = CDNMapper.hbThemes.assets(this.hbThemeId, "wifi2Icon", "png", this.cacheUUID);
        }
        if (!!this.wifi3IconFile) {
            this.wifi3IconUrl = CDNMapper.hbThemes.assets(this.hbThemeId, "wifi3Icon", "png", this.cacheUUID);
        }
        if (!!this.ethIconFile) {
            this.ethIconUrl = CDNMapper.hbThemes.assets(this.hbThemeId, "ethIcon", "png", this.cacheUUID);
        }
        if (!!this.backgroundImageFile) {
            this.backgroundImageUrl = CDNMapper.hbThemes.assets(this.hbThemeId, "backgroundImage", "png", this.cacheUUID);
        }
    }

}