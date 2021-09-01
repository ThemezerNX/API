import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {HBThemeEntity} from "../HBTheme.entity";
import {CachableEntityInterface} from "../../common/interfaces/Cachable.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";

@Entity()
export class HBThemeAssetsEntity extends CachableEntityInterface {

    @OneToOne(() => HBThemeEntity, hbThemeEntity => hbThemeEntity.assets, {onDelete: "CASCADE"})
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

    get batteryIconUrl(): string {
        return !!this.batteryIconFile ? CDNMapper.hbThemes.assets(this.hbThemeId,
            "batteryIcon",
            "png",
            this.cacheID) : null;
    }

    get chargingIconUrl(): string {
        return !!this.chargingIconFile ? CDNMapper.hbThemes.assets(this.hbThemeId,
            "chargingIcon",
            "png",
            this.cacheID) : null;
    }

    get folderIconUrl(): string {
        return !!this.folderIconFile ? CDNMapper.hbThemes.assets(this.hbThemeId,
            "folderIcon",
            "png",
            this.cacheID) : null;
    }

    get invalidIconUrl(): string {
        return !!this.invalidIconFile ? CDNMapper.hbThemes.assets(this.hbThemeId,
            "invalidIcon",
            "png",
            this.cacheID) : null;
    }

    get themeIconDarkUrl(): string {
        return !!this.themeIconDarkFile ? CDNMapper.hbThemes.assets(this.hbThemeId,
            "themeIconDark",
            "png",
            this.cacheID) : null;
    }

    get themeIconLightUrl(): string {
        return !!this.themeIconLightFile ? CDNMapper.hbThemes.assets(this.hbThemeId,
            "themeIconLight",
            "png",
            this.cacheID) : null;
    }

    get airplaneIconUrl(): string {
        return !!this.airplaneIconFile ? CDNMapper.hbThemes.assets(this.hbThemeId,
            "airplaneIcon",
            "png",
            this.cacheID) : null;
    }

    get wifiNoneIconUrl(): string {
        return !!this.wifiNoneIconFile ? CDNMapper.hbThemes.assets(this.hbThemeId,
            "wifiNoneIcon",
            "png",
            this.cacheID) : null;
    }

    get wifi1IconUrl(): string {
        return !!this.wifi1IconFile ? CDNMapper.hbThemes.assets(this.hbThemeId,
            "wifi1Icon",
            "png",
            this.cacheID) : null;
    }

    get wifi2IconUrl(): string {
        return !!this.wifi2IconFile ? CDNMapper.hbThemes.assets(this.hbThemeId,
            "wifi2Icon",
            "png",
            this.cacheID) : null;
    }

    get wifi3IconUrl(): string {
        return !!this.wifi3IconFile ? CDNMapper.hbThemes.assets(this.hbThemeId,
            "wifi3Icon",
            "png",
            this.cacheID) : null;
    }

    get ethIconUrl(): string {
        return !!this.ethIconFile ? CDNMapper.hbThemes.assets(this.hbThemeId,
            "ethIcon",
            "png",
            this.cacheID) : null;
    }

    get backgroundImageUrl(): string {
        return !!this.backgroundImageFile ? CDNMapper.hbThemes.assets(this.hbThemeId,
            "backgroundImage",
            "png",
            this.cacheID) : null;
    }

}