import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {ThemeEntity} from "../Theme.entity";
import {CDNMapper} from "../../common/CDNMapper";
import {CachableEntityInterface} from "../../common/interfaces/Cachable.entity.interface";

@Entity()
export class ThemeAssetsEntity extends CachableEntityInterface {

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
            this.cacheID) : null;
    };

    get albumIconUrl(): string {
        return !!this.albumIconFile ? CDNMapper.themes.assets(this.themeId,
            "albumIcon",
            "png",
            this.cacheID) : null;
    };

    get newsIconUrl(): string {
        return !!this.newsIconFile ? CDNMapper.themes.assets(this.themeId,
            "newsIcon",
            "png",
            this.cacheID) : null;
    };

    get shopIconUrl(): string {
        return !!this.shopIconFile ? CDNMapper.themes.assets(this.themeId,
            "shopIcon",
            "png",
            this.cacheID) : null;
    };

    get controllerIconUrl(): string {
        return !!this.controllerIconFile ? CDNMapper.themes.assets(this.themeId,
            "controllerIcon",
            "png",
            this.cacheID) : null;
    };

    get settingsIconUrl(): string {
        return !!this.settingsIconFile ? CDNMapper.themes.assets(this.themeId,
            "settingsIcon",
            "png",
            this.cacheID) : null;
    };

    get powerIconUrl(): string {
        return !!this.powerIconFile ? CDNMapper.themes.assets(this.themeId,
            "powerIcon",
            "png",
            this.cacheID) : null;
    };

    get homeIconUrl(): string {
        return !!this.homeIconFile ? CDNMapper.themes.assets(this.themeId,
            "homeIcon",
            "png",
            this.cacheID) : null;
    };

}