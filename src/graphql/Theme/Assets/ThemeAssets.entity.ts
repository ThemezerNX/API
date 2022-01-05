import {AfterLoad, Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {ThemeEntity} from "../Theme.entity";
import {CDNMapper} from "../../common/CDNMapper";
import {AssetsEntityInterface} from "../../common/interfaces/Assets.entity.interface";
import {ReadStream} from "fs";
import {generateBackground} from "../../common/processors/ScreenshotProcessor";
import {SelectAlways} from "perch-query-builder";

@Entity()
export class ThemeAssetsEntity extends AssetsEntityInterface {

    static INFO_FILENAME = "info.json";
    static LAYOUT_FILENAME = "layout.json";
    static COMMON_FILENAME = "common.json";

    static BACKGROUND_IMAGE_FILE = {name: "image.jpg", minWidth: 1280, minHeight: 720};
    static ALBUM_ICON_FILE = {name: "album.png", width: 64, height: 56};
    static NEWS_ICON_FILE = {name: "news.png", width: 64, height: 56};
    static SHOP_ICON_FILE = {name: "shop.png", width: 64, height: 56};
    static CONTROLLER_ICON_FILE = {name: "controller.png", width: 64, height: 56};
    static SETTINGS_ICON_FILE = {name: "settings.png", width: 64, height: 56};
    static POWER_ICON_FILE = {name: "power.png", width: 64, height: 56};
    // home aka lock icon
    static HOME_ICON_FILE = {name: "lock.png", width: 64, height: 56};

    @OneToOne(() => ThemeEntity, theme => theme.assets, {onDelete: "CASCADE"})
    @JoinColumn({name: "themeId"})
    theme: ThemeEntity;

    @PrimaryColumn({update: false})
    themeId: string;

    @Column("varchar", {nullable: true})
    customLayoutJson?: string;

    @Column("varchar", {nullable: true})
    customCommonLayoutJson?: string;

    @Column("bytea", {nullable: true})
    backgroundImageFile?: Buffer;
    @Column("bytea", {nullable: true})
    albumIconFile?: Buffer;
    @Column("bytea", {nullable: true})
    newsIconFile?: Buffer;
    @Column("bytea", {nullable: true})
    shopIconFile?: Buffer;
    @Column("bytea", {nullable: true})
    controllerIconFile?: Buffer;
    @Column("bytea", {nullable: true})
    settingsIconFile?: Buffer;
    @Column("bytea", {nullable: true})
    powerIconFile?: Buffer;
    @Column("bytea", {nullable: true})
    homeIconFile?: Buffer;

    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"backgroundImageFile\")",
    })
    @SelectAlways()
    backgroundImageHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"albumIconFile\")",
    })
    @SelectAlways()
    albumIconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"newsIconFile\")",
    })
    @SelectAlways()
    newsIconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"shopIconFile\")",
    })
    @SelectAlways()
    shopIconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"controllerIconFile\")",
    })
    @SelectAlways()
    controllerIconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"settingsIconFile\")",
    })
    @SelectAlways()
    settingsIconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"powerIconFile\")",
    })
    @SelectAlways()
    powerIconHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"homeIconFile\")",
    })
    @SelectAlways()
    homeIconHash?: Buffer;

    imageUrl: string;
    albumIconUrl: string;
    newsIconUrl: string;
    shopIconUrl: string;
    controllerIconUrl: string;
    settingsIconUrl: string;
    powerIconUrl: string;
    homeIconUrl: string;

    @AfterLoad()
    setUrls() {
        this.imageUrl = !!this.backgroundImageHash ? CDNMapper.themes.assets(this.themeId,
            ThemeAssetsEntity.BACKGROUND_IMAGE_FILE.name,
            this.backgroundImageHash) : null;
        this.albumIconUrl = !!this.albumIconHash ? CDNMapper.themes.assets(this.themeId,
            ThemeAssetsEntity.ALBUM_ICON_FILE.name,
            this.albumIconHash) : null;
        this.newsIconUrl = !!this.newsIconHash ? CDNMapper.themes.assets(this.themeId,
            ThemeAssetsEntity.NEWS_ICON_FILE.name,
            this.newsIconHash) : null;
        this.shopIconUrl = !!this.shopIconHash ? CDNMapper.themes.assets(this.themeId,
            ThemeAssetsEntity.SHOP_ICON_FILE.name,
            this.shopIconHash) : null;
        this.controllerIconUrl = !!this.controllerIconHash ? CDNMapper.themes.assets(this.themeId,
            ThemeAssetsEntity.CONTROLLER_ICON_FILE.name,
            this.controllerIconHash) : null;
        this.settingsIconUrl = !!this.settingsIconHash ? CDNMapper.themes.assets(this.themeId,
            ThemeAssetsEntity.SETTINGS_ICON_FILE.name,
            this.settingsIconHash) : null;
        this.powerIconUrl = !!this.powerIconHash ? CDNMapper.themes.assets(this.themeId,
            ThemeAssetsEntity.POWER_ICON_FILE.name,
            this.powerIconHash) : null;
        this.homeIconUrl = !!this.homeIconHash ? CDNMapper.themes.assets(this.themeId,
            ThemeAssetsEntity.HOME_ICON_FILE.name,
            this.homeIconHash) : null;
    }

    async setImage(createReadStream: () => ReadStream) {
        this.backgroundImageFile = await generateBackground(createReadStream, ThemeAssetsEntity.BACKGROUND_IMAGE_FILE);
    }

}