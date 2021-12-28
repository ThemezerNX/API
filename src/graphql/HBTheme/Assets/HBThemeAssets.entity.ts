import {AfterLoad, Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {HBThemeEntity} from "../HBTheme.entity";
import {CDNMapper} from "../../common/CDNMapper";
import {AssetsEntityInterface} from "../../common/interfaces/Assets.entity.interface";
import {SelectAlways} from "perch-query-builder";

@Entity()
export class HBThemeAssetsEntity extends AssetsEntityInterface {

    static CFG_FILENAME = "theme.cfg";
    static ICON_FILENAME = "icon.jpg";

    static BATTERY_ICON_FILENAME = "battery_icon.png";
    static CHARGING_ICON_FILENAME = "charging_icon.png";
    static FOLDER_ICON_FILENAME = "folder_icon.jpg";
    static INVALID_ICON_FILENAME = "invalid_icon.jpg";
    static THEME_ICON_DARK_FILENAME = "theme_icon_dark.jpg";
    static THEME_ICON_LIGHT_FILENAME = "theme_icon_light.jpg";
    static AIRPLANE_ICON_FILENAME = "airplane_icon.png";
    static WIFI_NONE_ICON_FILENAME = "wifi_none_icon.png";
    static WIFI1_ICON_FILENAME = "wifi1_icon.png";
    static WIFI2_ICON_FILENAME = "wifi2_icon.png";
    static WIFI3_ICON_FILENAME = "wifi3_icon.png";
    static ETH_ICON_FILENAME = "eth_icon.png";
    static ETH_NONE_ICON_FILENAME = "eth_none_icon.png";
    static BACKGROUND_IMAGE_FILENAME = "background_image.jpg";

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
    ethNoneIconFile?: Buffer;
    @Column("bytea", {nullable: true})
    backgroundImageFile?: Buffer;

    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"batteryIconFile\")",
    })
    @SelectAlways()
    readonly batteryIconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"chargingIconFile\")",
    })
    @SelectAlways()
    readonly chargingIconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"folderIconFile\")",
    })
    @SelectAlways()
    readonly folderIconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"invalidIconFile\")",
    })
    @SelectAlways()
    readonly invalidIconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"themeIconDarkFile\")",
    })
    @SelectAlways()
    readonly themeIconDarkHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"themeIconLightFile\")",
    })
    @SelectAlways()
    readonly themeIconLightHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"airplaneIconFile\")",
    })
    @SelectAlways()
    readonly airplaneIconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"wifiNoneIconFile\")",
    })
    @SelectAlways()
    readonly wifiNoneIconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"wifi1IconFile\")",
    })
    @SelectAlways()
    readonly wifi1IconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"wifi2IconFile\")",
    })
    @SelectAlways()
    readonly wifi2IconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"wifi3IconFile\")",
    })
    @SelectAlways()
    readonly wifi3IconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"ethIconFile\")",
    })
    @SelectAlways()
    readonly ethIconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"ethNoneIconFile\")",
    })
    @SelectAlways()
    readonly ethNoneIconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"backgroundImageFile\")",
    })
    @SelectAlways()
    readonly backgroundImageHash?: Buffer;


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
    ethNoneIconUrl: string;
    backgroundImageUrl: string;

    @AfterLoad()
    setUrls() {
        this.batteryIconUrl = !!this.batteryIconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.BATTERY_ICON_FILENAME,
            this.batteryIconHash) : null;
        this.chargingIconUrl = !!this.chargingIconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.CHARGING_ICON_FILENAME,
            this.chargingIconHash) : null;
        this.folderIconUrl = !!this.folderIconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.FOLDER_ICON_FILENAME,
            this.folderIconHash) : null;
        this.invalidIconUrl = !!this.invalidIconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.INVALID_ICON_FILENAME,
            this.invalidIconHash) : null;
        this.themeIconDarkUrl = !!this.themeIconDarkHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.THEME_ICON_DARK_FILENAME,
            this.themeIconDarkHash) : null;
        this.themeIconLightUrl = !!this.themeIconLightHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.THEME_ICON_LIGHT_FILENAME,
            this.themeIconLightHash) : null;
        this.airplaneIconUrl = !!this.airplaneIconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.AIRPLANE_ICON_FILENAME,
            this.airplaneIconHash) : null;
        this.wifiNoneIconUrl = !!this.wifiNoneIconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.WIFI_NONE_ICON_FILENAME,
            this.wifiNoneIconHash) : null;
        this.wifi1IconUrl = !!this.wifi1IconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.WIFI1_ICON_FILENAME,
            this.wifi1IconHash) : null;
        this.wifi2IconUrl = !!this.wifi2IconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.WIFI2_ICON_FILENAME,
            this.wifi2IconHash) : null;
        this.wifi3IconUrl = !!this.wifi3IconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.WIFI3_ICON_FILENAME,
            this.wifi3IconHash) : null;
        this.ethIconUrl = !!this.ethIconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.ETH_ICON_FILENAME,
            this.ethIconHash) : null;
        this.ethNoneIconUrl = !!this.ethNoneIconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.ETH_NONE_ICON_FILENAME,
            this.ethNoneIconHash) : null;
        this.backgroundImageUrl = !!this.backgroundImageHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.BACKGROUND_IMAGE_FILENAME,
            this.backgroundImageHash) : null;
    }

}