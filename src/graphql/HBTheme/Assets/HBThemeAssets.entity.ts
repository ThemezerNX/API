import {AfterLoad, Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {HBThemeEntity} from "../HBTheme.entity";
import {CDNMapper} from "../../common/CDNMapper";
import {AssetsEntityInterface} from "../../common/interfaces/Assets.entity.interface";
import {SelectAlways} from "perch-query-builder";
import {ReadStream} from "fs";
import {generateBackground} from "../../common/processors/ScreenshotProcessor";

@Entity()
export class HBThemeAssetsEntity extends AssetsEntityInterface {

    static CFG_FILENAME = "theme.cfg";
    static ICON_FILE = {name: "icon.jpg", width: 256, height: 256};

    static BATTERY_ICON_FILE = {name: "battery_icon.png", width: 50, height: 50};
    static CHARGING_ICON_FILE = {name: "charging_icon.png", width: 50, height: 50};
    static FOLDER_ICON_FILE = {name: "folder_icon.jpg", width: 256, height: 256};
    static INVALID_ICON_FILE = {name: "invalid_icon.jpg", width: 50, height: 256};
    static THEME_ICON_DARK_FILE = {name: "theme_icon_dark.jpg", width: 256, height: 256};
    static THEME_ICON_LIGHT_FILE = {name: "theme_icon_light.jpg", width: 256, height: 256};
    static AIRPLANE_ICON_FILE = {name: "airplane_icon.png", width: 50, height: 50};
    static WIFI_NONE_ICON_FILE = {name: "wifi_none_icon.png", width: 50, height: 50};
    static WIFI1_ICON_FILE = {name: "wifi1_icon.png", width: 50, height: 50};
    static WIFI2_ICON_FILE = {name: "wifi2_icon.png", width: 50, height: 50};
    static WIFI3_ICON_FILE = {name: "wifi3_icon.png", width: 50, height: 50};
    static ETH_ICON_FILE = {name: "eth_icon.png", width: 50, height: 50};
    static ETH_NONE_ICON_FILE = {name: "eth_none_icon.png", width: 50, height: 50};
    static BACKGROUND_IMAGE_FILE = {
        name: "background_image.jpg",
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
    };

    @OneToOne(() => HBThemeEntity, hbthemeEntity => hbthemeEntity.assets, {onDelete: "CASCADE"})
    @JoinColumn({name: "hbthemeId"})
    hbtheme: HBThemeEntity;

    @PrimaryColumn({update: false})
    hbthemeId: string;

    @Column({type: "varchar", nullable: true})
    layout?: string;
    @Column({type: "bytea", nullable: true})
    iconFile?: Buffer;

    @Column({type: "bytea", nullable: true})
    batteryIconFile?: Buffer;
    @Column({type: "bytea", nullable: true})
    chargingIconFile?: Buffer;
    @Column({type: "bytea", nullable: true})
    folderIconFile?: Buffer;
    @Column({type: "bytea", nullable: true})
    invalidIconFile?: Buffer;
    @Column({type: "bytea", nullable: true})
    themeIconDarkFile?: Buffer;
    @Column({type: "bytea", nullable: true})
    themeIconLightFile?: Buffer;
    @Column({type: "bytea", nullable: true})
    airplaneIconFile?: Buffer;
    @Column({type: "bytea", nullable: true})
    wifiNoneIconFile?: Buffer;
    @Column({type: "bytea", nullable: true})
    wifi1IconFile?: Buffer;
    @Column({type: "bytea", nullable: true})
    wifi2IconFile?: Buffer;
    @Column({type: "bytea", nullable: true})
    wifi3IconFile?: Buffer;
    @Column({type: "bytea", nullable: true})
    ethIconFile?: Buffer;
    @Column({type: "bytea", nullable: true})
    ethNoneIconFile?: Buffer;
    @Column({type: "bytea", nullable: true})
    backgroundImageFile?: Buffer;

    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"iconFile\")",
    })
    @SelectAlways()
    readonly iconHash?: Buffer;

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
            HBThemeAssetsEntity.BATTERY_ICON_FILE.name,
            this.batteryIconHash) : null;
        this.chargingIconUrl = !!this.chargingIconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.CHARGING_ICON_FILE.name,
            this.chargingIconHash) : null;
        this.folderIconUrl = !!this.folderIconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.FOLDER_ICON_FILE.name,
            this.folderIconHash) : null;
        this.invalidIconUrl = !!this.invalidIconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.INVALID_ICON_FILE.name,
            this.invalidIconHash) : null;
        this.themeIconDarkUrl = !!this.themeIconDarkHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.THEME_ICON_DARK_FILE.name,
            this.themeIconDarkHash) : null;
        this.themeIconLightUrl = !!this.themeIconLightHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.THEME_ICON_LIGHT_FILE.name,
            this.themeIconLightHash) : null;
        this.airplaneIconUrl = !!this.airplaneIconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.AIRPLANE_ICON_FILE.name,
            this.airplaneIconHash) : null;
        this.wifiNoneIconUrl = !!this.wifiNoneIconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.WIFI_NONE_ICON_FILE.name,
            this.wifiNoneIconHash) : null;
        this.wifi1IconUrl = !!this.wifi1IconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.WIFI1_ICON_FILE.name,
            this.wifi1IconHash) : null;
        this.wifi2IconUrl = !!this.wifi2IconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.WIFI2_ICON_FILE.name,
            this.wifi2IconHash) : null;
        this.wifi3IconUrl = !!this.wifi3IconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.WIFI3_ICON_FILE.name,
            this.wifi3IconHash) : null;
        this.ethIconUrl = !!this.ethIconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.ETH_ICON_FILE.name,
            this.ethIconHash) : null;
        this.ethNoneIconUrl = !!this.ethNoneIconHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.ETH_NONE_ICON_FILE.name,
            this.ethNoneIconHash) : null;
        this.backgroundImageUrl = !!this.backgroundImageHash ? CDNMapper.hbthemes.assets(this.hbthemeId,
            HBThemeAssetsEntity.BACKGROUND_IMAGE_FILE.name,
            this.backgroundImageHash) : null;
    }

    async setImage(createReadStream: () => ReadStream) {
        this.backgroundImageFile = await generateBackground(createReadStream,
            HBThemeAssetsEntity.BACKGROUND_IMAGE_FILE);
    }

}