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

    @Column("bytea", {nullable: true})
    batteryIconFile?: Buffer;
    @Column("bytea", {nullable: true})
    chargingIconFile?: Buffer;
    @Column("bytea", {nullable: true})
    folderIconFile?: Buffer;
    @Column("bytea", {nullable: true})
    invalidIconFile?: Buffer;
    @Column("bytea", {nullable: true})
    themeIconDarkFile?: Buffer;
    @Column("bytea", {nullable: true})
    themeIconLightFile?: Buffer;
    @Column("bytea", {nullable: true})
    airplaneIconFile?: Buffer;
    @Column("bytea", {nullable: true})
    wifiNoneIconFile?: Buffer;
    @Column("bytea", {nullable: true})
    wifi1IconFile?: Buffer;
    @Column("bytea", {nullable: true})
    wifi2IconFile?: Buffer;
    @Column("bytea", {nullable: true})
    wifi3IconFile?: Buffer;
    @Column("bytea", {nullable: true})
    ethIconFile?: Buffer;
    @Column("bytea", {nullable: true})
    backgroundImageFile?: Buffer;

    get batteryIconUrl(): string {
        return !!this.batteryIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "batteryIcon",
            "png",
            this.cacheId) : null;
    }

    get chargingIconUrl(): string {
        return !!this.chargingIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "chargingIcon",
            "png",
            this.cacheId) : null;
    }

    get folderIconUrl(): string {
        return !!this.folderIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "folderIcon",
            "jpg",
            this.cacheId) : null;
    }

    get invalidIconUrl(): string {
        return !!this.invalidIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "invalidIcon",
            "jpg",
            this.cacheId) : null;
    }

    get themeIconDarkUrl(): string {
        return !!this.themeIconDarkFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "themeIconDark",
            "jpg",
            this.cacheId) : null;
    }

    get themeIconLightUrl(): string {
        return !!this.themeIconLightFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "themeIconLight",
            "jpg",
            this.cacheId) : null;
    }

    get airplaneIconUrl(): string {
        return !!this.airplaneIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "airplaneIcon",
            "png",
            this.cacheId) : null;
    }

    get wifiNoneIconUrl(): string {
        return !!this.wifiNoneIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "wifiNoneIcon",
            "png",
            this.cacheId) : null;
    }

    get wifi1IconUrl(): string {
        return !!this.wifi1IconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "wifi1Icon",
            "png",
            this.cacheId) : null;
    }

    get wifi2IconUrl(): string {
        return !!this.wifi2IconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "wifi2Icon",
            "png",
            this.cacheId) : null;
    }

    get wifi3IconUrl(): string {
        return !!this.wifi3IconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "wifi3Icon",
            "png",
            this.cacheId) : null;
    }

    get ethIconUrl(): string {
        return !!this.ethIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "ethIcon",
            "png",
            this.cacheId) : null;
    }

    get backgroundImageUrl(): string {
        return !!this.backgroundImageFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "backgroundImage",
            "jpg",
            this.cacheId) : null;
    }

}