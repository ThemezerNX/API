import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
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

    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"imageFile\")"})
    imageHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"albumIconFile\")"})
    albumIconHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"newsIconFile\")"})
    newsIconHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"shopIconFile\")"})
    shopIconHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"controllerIconFile\")"})
    controllerIconHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"settingsIconFile\")"})
    settingsIconHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"powerIconFile\")"})
    powerIconHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"homeIconFile\")"})
    homeIconHash?: Buffer;

    get imageUrl(): string {
        return !!this.imageFile ? CDNMapper.themes.assets(this.themeId,
            "image",
            "jpg",
            this.imageHash) : null;
    };

    get albumIconUrl(): string {
        return !!this.albumIconFile ? CDNMapper.themes.assets(this.themeId,
            "albumIcon",
            "png",
            this.albumIconHash) : null;
    };

    get newsIconUrl(): string {
        return !!this.newsIconFile ? CDNMapper.themes.assets(this.themeId,
            "newsIcon",
            "png",
            this.newsIconHash) : null;
    };

    get shopIconUrl(): string {
        return !!this.shopIconFile ? CDNMapper.themes.assets(this.themeId,
            "shopIcon",
            "png",
            this.shopIconHash) : null;
    };

    get controllerIconUrl(): string {
        return !!this.controllerIconFile ? CDNMapper.themes.assets(this.themeId,
            "controllerIcon",
            "png",
            this.controllerIconHash) : null;
    };

    get settingsIconUrl(): string {
        return !!this.settingsIconFile ? CDNMapper.themes.assets(this.themeId,
            "settingsIcon",
            "png",
            this.settingsIconHash) : null;
    };

    get powerIconUrl(): string {
        return !!this.powerIconFile ? CDNMapper.themes.assets(this.themeId,
            "powerIcon",
            "png",
            this.powerIconHash) : null;
    };

    get homeIconUrl(): string {
        return !!this.homeIconFile ? CDNMapper.themes.assets(this.themeId,
            "homeIcon",
            "png",
            this.homeIconHash) : null;
    };

}