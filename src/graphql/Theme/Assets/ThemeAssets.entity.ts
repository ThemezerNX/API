import {AfterLoad, Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {ThemeEntity} from "../Theme.entity";
import {CDNMapper} from "../../common/CDNMapper";
import {AssetsEntityInterface} from "../../common/interfaces/Assets.entity.interface";
import {ReadStream} from "fs";
import {generateBackground} from "../../common/processors/ScreenshotProcessor";

@Entity()
export class ThemeAssetsEntity extends AssetsEntityInterface {

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

    @Column({type: "bytea", nullable: true, generatedType: "STORED", asExpression: "sha256(\"imageFile\")"})
    imageHash?: Buffer;
    @Column({type: "bytea", nullable: true, generatedType: "STORED", asExpression: "sha256(\"albumIconFile\")"})
    albumIconHash?: Buffer;
    @Column({type: "bytea", nullable: true, generatedType: "STORED", asExpression: "sha256(\"newsIconFile\")"})
    newsIconHash?: Buffer;
    @Column({type: "bytea", nullable: true, generatedType: "STORED", asExpression: "sha256(\"shopIconFile\")"})
    shopIconHash?: Buffer;
    @Column({type: "bytea", nullable: true, generatedType: "STORED", asExpression: "sha256(\"controllerIconFile\")"})
    controllerIconHash?: Buffer;
    @Column({type: "bytea", nullable: true, generatedType: "STORED", asExpression: "sha256(\"settingsIconFile\")"})
    settingsIconHash?: Buffer;
    @Column({type: "bytea", nullable: true, generatedType: "STORED", asExpression: "sha256(\"powerIconFile\")"})
    powerIconHash?: Buffer;
    @Column({type: "bytea", nullable: true, generatedType: "STORED", asExpression: "sha256(\"homeIconFile\")"})
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
            "image",
            "jpg",
            this.imageHash) : null;
        this.albumIconUrl = !!this.albumIconHash ? CDNMapper.themes.assets(this.themeId,
            "albumIcon",
            "png",
            this.albumIconHash) : null;
        this.newsIconUrl = !!this.newsIconHash ? CDNMapper.themes.assets(this.themeId,
            "newsIcon",
            "png",
            this.newsIconHash) : null;
        this.shopIconUrl = !!this.shopIconHash ? CDNMapper.themes.assets(this.themeId,
            "shopIcon",
            "png",
            this.shopIconHash) : null;
        this.controllerIconUrl = !!this.controllerIconHash ? CDNMapper.themes.assets(this.themeId,
            "controllerIcon",
            "png",
            this.controllerIconHash) : null;
        this.settingsIconUrl = !!this.settingsIconHash ? CDNMapper.themes.assets(this.themeId,
            "settingsIcon",
            "png",
            this.settingsIconHash) : null;
        this.powerIconUrl = !!this.powerIconHash ? CDNMapper.themes.assets(this.themeId,
            "powerIcon",
            "png",
            this.powerIconHash) : null;
        this.homeIconUrl = !!this.homeIconHash ? CDNMapper.themes.assets(this.themeId,
            "homeIcon",
            "png",
            this.homeIconHash) : null;
    }

    async setImage(createReadStream: () => ReadStream) {
        this.imageFile = await generateBackground(createReadStream);
    }

}