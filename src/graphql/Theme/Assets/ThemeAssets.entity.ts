import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {ThemeEntity} from "../Theme.entity";
import {CDNMapper} from "../../common/CDNMapper";
import {AssetsEntityInterface} from "../../common/interfaces/Assets.entity.interface";

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

    get imageUrl(): string {
        return !!this.imageFile ? CDNMapper.themes.assets(this.themeId,
            "image",
            "jpg",
            this.cacheId) : null;
    };

    get albumIconUrl(): string {
        return !!this.albumIconFile ? CDNMapper.themes.assets(this.themeId,
            "albumIcon",
            "png",
            this.cacheId) : null;
    };

    get newsIconUrl(): string {
        return !!this.newsIconFile ? CDNMapper.themes.assets(this.themeId,
            "newsIcon",
            "png",
            this.cacheId) : null;
    };

    get shopIconUrl(): string {
        return !!this.shopIconFile ? CDNMapper.themes.assets(this.themeId,
            "shopIcon",
            "png",
            this.cacheId) : null;
    };

    get controllerIconUrl(): string {
        return !!this.controllerIconFile ? CDNMapper.themes.assets(this.themeId,
            "controllerIcon",
            "png",
            this.cacheId) : null;
    };

    get settingsIconUrl(): string {
        return !!this.settingsIconFile ? CDNMapper.themes.assets(this.themeId,
            "settingsIcon",
            "png",
            this.cacheId) : null;
    };

    get powerIconUrl(): string {
        return !!this.powerIconFile ? CDNMapper.themes.assets(this.themeId,
            "powerIcon",
            "png",
            this.cacheId) : null;
    };

    get homeIconUrl(): string {
        return !!this.homeIconFile ? CDNMapper.themes.assets(this.themeId,
            "homeIcon",
            "png",
            this.cacheId) : null;
    };

}