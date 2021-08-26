import {AfterLoad, Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {ThemeEntity} from "../Theme.entity";
import {CDNMapper} from "../../common/CDNMapper";
import {CachableEntityInterface} from "../../common/interfaces/Cachable.entity.interface";

@Entity()
export class ThemeAssetsEntity extends CachableEntityInterface {

    @OneToOne(() => ThemeEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "themeId"})
    theme: ThemeEntity;

    @PrimaryColumn()
    themeId: string;

    @Column("jsonb", {nullable: true})
    customLayoutJson?: JSON;

    @Column("jsonb", {nullable: true})
    customCommonLayoutJson?: JSON;

    @Column("bytea", {nullable: true})
    imageFile?: any;
    @Column("bytea", {nullable: true})
    albumIconFile?: any;
    @Column("bytea", {nullable: true})
    newsIconFile?: any;
    @Column("bytea", {nullable: true})
    shopIconFile?: any;
    @Column("bytea", {nullable: true})
    controllerIconFile?: any;
    @Column("bytea", {nullable: true})
    settingsIconFile?: any;
    @Column("bytea", {nullable: true})
    powerIconFile?: any;
    @Column("bytea", {nullable: true})
    homeIconFile?: any;

    imageUrl: string;
    albumIconUrl: string;
    newsIconUrl: string;
    shopIconUrl: string;
    controllerIconUrl: string;
    settingsIconUrl: string;
    powerIconUrl: string;
    homeIconUrl: string;

    @AfterLoad()
    afterLoad() {
        if (!!this.imageFile) {
            this.imageUrl = CDNMapper.themes.assets(this.themeId, "imageUrl", "jpg", this.cacheUUID);
        }
        if (!!this.albumIconFile) {
            this.albumIconUrl = CDNMapper.themes.assets(this.themeId, "albumIcon", "png", this.cacheUUID);
        }
        if (!!this.newsIconFile) {
            this.newsIconUrl = CDNMapper.themes.assets(this.themeId, "newsIcon", "png", this.cacheUUID);
        }
        if (!!this.shopIconFile) {
            this.shopIconUrl = CDNMapper.themes.assets(this.themeId, "shopIcon", "png", this.cacheUUID);
        }
        if (!!this.controllerIconFile) {
            this.controllerIconUrl = CDNMapper.themes.assets(this.themeId, "controllerIcon", "png", this.cacheUUID);
        }
        if (!!this.settingsIconFile) {
            this.settingsIconUrl = CDNMapper.themes.assets(this.themeId, "settingsIcon", "png", this.cacheUUID);
        }
        if (!!this.powerIconFile) {
            this.powerIconUrl = CDNMapper.themes.assets(this.themeId, "powerIcon", "png", this.cacheUUID);
        }
        if (!!this.homeIconFile) {
            this.homeIconUrl = CDNMapper.themes.assets(this.themeId, "homeIcon", "png", this.cacheUUID);
        }
    }

}