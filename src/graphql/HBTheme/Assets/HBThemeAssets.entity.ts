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
    batteryIconFile: Buffer;
    @Column("bytea")
    chargingIconFile: Buffer;
    @Column("bytea")
    folderIconFile: Buffer;
    @Column("bytea")
    invalidIconFile: Buffer;
    @Column("bytea")
    themeIconDarkFile: Buffer;
    @Column("bytea")
    themeIconLightFile: Buffer;
    @Column("bytea")
    airplaneIconFile: Buffer;
    @Column("bytea")
    wifiNoneIconFile: Buffer;
    @Column("bytea")
    wifi1IconFile: Buffer;
    @Column("bytea")
    wifi2IconFile: Buffer;
    @Column("bytea")
    wifi3IconFile: Buffer;
    @Column("bytea")
    ethIconFile: Buffer;
    @Column("bytea")
    backgroundImageFile: Buffer;

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
            "jpg",
            this.cacheID) : null;
    }

    get invalidIconUrl(): string {
        return !!this.invalidIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "invalidIcon",
            "jpg",
            this.cacheID) : null;
    }

    get themeIconDarkUrl(): string {
        return !!this.themeIconDarkFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "themeIconDark",
            "jpg",
            this.cacheID) : null;
    }

    get themeIconLightUrl(): string {
        return !!this.themeIconLightFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "themeIconLight",
            "jpg",
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
            "jpg",
            this.cacheID) : null;
    }

}