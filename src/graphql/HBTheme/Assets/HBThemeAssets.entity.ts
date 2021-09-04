import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {HBThemeEntity} from "../HBTheme.entity";
import {CachableEntityInterface} from "../../common/interfaces/Cachable.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";

@Entity()
export class HBThemeAssetsEntity extends CachableEntityInterface {

    @OneToOne(() => HBThemeEntity, hbthemeEntity => hbthemeEntity.assets, {onDelete: "CASCADE"})
    @JoinColumn({name: "hbthemeId"})
    hbtheme: HBThemeEntity;

    @PrimaryColumn({update: false})
    hbthemeId: string;

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
        return !!this.batteryIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "batteryIcon",
            "png",
            this.cacheID) : null;
    }

    get chargingIconUrl(): string {
        return !!this.chargingIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "chargingIcon",
            "png",
            this.cacheID) : null;
    }

    get folderIconUrl(): string {
        return !!this.folderIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "folderIcon",
            "png",
            this.cacheID) : null;
    }

    get invalidIconUrl(): string {
        return !!this.invalidIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "invalidIcon",
            "png",
            this.cacheID) : null;
    }

    get themeIconDarkUrl(): string {
        return !!this.themeIconDarkFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "themeIconDark",
            "png",
            this.cacheID) : null;
    }

    get themeIconLightUrl(): string {
        return !!this.themeIconLightFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "themeIconLight",
            "png",
            this.cacheID) : null;
    }

    get airplaneIconUrl(): string {
        return !!this.airplaneIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "airplaneIcon",
            "png",
            this.cacheID) : null;
    }

    get wifiNoneIconUrl(): string {
        return !!this.wifiNoneIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "wifiNoneIcon",
            "png",
            this.cacheID) : null;
    }

    get wifi1IconUrl(): string {
        return !!this.wifi1IconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "wifi1Icon",
            "png",
            this.cacheID) : null;
    }

    get wifi2IconUrl(): string {
        return !!this.wifi2IconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "wifi2Icon",
            "png",
            this.cacheID) : null;
    }

    get wifi3IconUrl(): string {
        return !!this.wifi3IconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "wifi3Icon",
            "png",
            this.cacheID) : null;
    }

    get ethIconUrl(): string {
        return !!this.ethIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "ethIcon",
            "png",
            this.cacheID) : null;
    }

    get backgroundImageUrl(): string {
        return !!this.backgroundImageFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "backgroundImage",
            "png",
            this.cacheID) : null;
    }

}