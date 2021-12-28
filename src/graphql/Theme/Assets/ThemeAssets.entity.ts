import {AfterLoad, Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {ThemeEntity} from "../Theme.entity";
import {CDNMapper} from "../../common/CDNMapper";
import {AssetsEntityInterface} from "../../common/interfaces/Assets.entity.interface";
import {ReadStream} from "fs";
import {generateBackground} from "../../common/processors/ScreenshotProcessor";
import {SelectAlways} from "perch-query-builder";

@Entity()
export class ThemeAssetsEntity extends AssetsEntityInterface {

    static IMAGE_FILENAME = "image.jpg";
    static ALBUM_ICON_FILENAME = "albumIcon.png";
    static NEWS_ICON_FILENAME = "newsIcon.png";
    static SHOP_ICON_FILENAME = "shopIcon.png";
    static CONTROLLER_ICON_FILENAME = "controllerIcon.png";
    static SETTINGS_ICON_FILENAME = "settingsIcon.png";
    static POWER_ICON_FILENAME = "powerIcon.png";
    static HOME_ICON_FILENAME = "homeIcon.png";

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
    imageFile?: Buffer;
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
        asExpression: "sha256(\"imageFile\")",
    })
    @SelectAlways()
    imageHash?: Buffer;
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
        this.imageUrl = !!this.imageHash ? CDNMapper.themes.assets(this.themeId,
            ThemeAssetsEntity.IMAGE_FILENAME,
            this.imageHash) : null;
        this.albumIconUrl = !!this.albumIconHash ? CDNMapper.themes.assets(this.themeId,
            ThemeAssetsEntity.ALBUM_ICON_FILENAME,
            this.albumIconHash) : null;
        this.newsIconUrl = !!this.newsIconHash ? CDNMapper.themes.assets(this.themeId,
            ThemeAssetsEntity.NEWS_ICON_FILENAME,
            this.newsIconHash) : null;
        this.shopIconUrl = !!this.shopIconHash ? CDNMapper.themes.assets(this.themeId,
            ThemeAssetsEntity.SHOP_ICON_FILENAME,
            this.shopIconHash) : null;
        this.controllerIconUrl = !!this.controllerIconHash ? CDNMapper.themes.assets(this.themeId,
            ThemeAssetsEntity.CONTROLLER_ICON_FILENAME,
            this.controllerIconHash) : null;
        this.settingsIconUrl = !!this.settingsIconHash ? CDNMapper.themes.assets(this.themeId,
            ThemeAssetsEntity.SETTINGS_ICON_FILENAME,
            this.settingsIconHash) : null;
        this.powerIconUrl = !!this.powerIconHash ? CDNMapper.themes.assets(this.themeId,
            ThemeAssetsEntity.POWER_ICON_FILENAME,
            this.powerIconHash) : null;
        this.homeIconUrl = !!this.homeIconHash ? CDNMapper.themes.assets(this.themeId,
            ThemeAssetsEntity.HOME_ICON_FILENAME,
            this.homeIconHash) : null;
    }

    async setImage(createReadStream: () => ReadStream) {
        this.imageFile = await generateBackground(createReadStream);
    }

}