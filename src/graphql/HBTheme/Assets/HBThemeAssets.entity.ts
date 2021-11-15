import {AfterLoad, Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {HBThemeEntity} from "../HBTheme.entity";
import {CDNMapper} from "../../common/CDNMapper";
import {AssetsEntityInterface} from "../../common/interfaces/Assets.entity.interface";

@Entity()
export class HBThemeAssetsEntity extends AssetsEntityInterface {

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

    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"batteryIconFile\")"})
    readonly batteryIconHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"chargingIconFile\")"})
    readonly chargingIconHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"folderIconFile\")"})
    readonly folderIconHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"invalidIconFile\")"})
    readonly invalidIconHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"themeIconDarkFile\")"})
    readonly themeIconDarkHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"themeIconLightFile\")"})
    readonly themeIconLightHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"airplaneIconFile\")"})
    readonly airplaneIconHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"wifiNoneIconFile\")"})
    readonly wifiNoneIconHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"wifi1IconFile\")"})
    readonly wifi1IconHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"wifi2IconFile\")"})
    readonly wifi2IconHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"wifi3IconFile\")"})
    readonly wifi3IconHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"ethIconFile\")"})
    readonly ethIconHash?: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"backgroundImageFile\")"})
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
    backgroundImageUrl: string;

    @AfterLoad()
    setUrls() {
        this.batteryIconUrl = !!this.batteryIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "batteryIcon",
            "png",
            this.batteryIconHash) : null;
        this.chargingIconUrl = !!this.chargingIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "chargingIcon",
            "png",
            this.chargingIconHash) : null;
        this.folderIconUrl = !!this.folderIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "folderIcon",
            "jpg",
            this.folderIconHash) : null;
        this.invalidIconUrl = !!this.invalidIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "invalidIcon",
            "jpg",
            this.invalidIconHash) : null;
        this.themeIconDarkUrl = !!this.themeIconDarkFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "themeIconDark",
            "jpg",
            this.themeIconDarkHash) : null;
        this.themeIconLightUrl = !!this.themeIconLightFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "themeIconLight",
            "jpg",
            this.themeIconLightHash) : null;
        this.airplaneIconUrl = !!this.airplaneIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "airplaneIcon",
            "png",
            this.airplaneIconHash) : null;
        this.wifiNoneIconUrl = !!this.wifiNoneIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "wifiNoneIcon",
            "png",
            this.wifiNoneIconHash) : null;
        this.wifi1IconUrl = !!this.wifi1IconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "wifi1Icon",
            "png",
            this.wifi1IconHash) : null;
        this.wifi2IconUrl = !!this.wifi2IconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "wifi2Icon",
            "png",
            this.wifi2IconHash) : null;
        this.wifi3IconUrl = !!this.wifi3IconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "wifi3Icon",
            "png",
            this.wifi3IconHash) : null;
        this.ethIconUrl = !!this.ethIconFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "ethIcon",
            "png",
            this.ethIconHash) : null;
        this.backgroundImageUrl = !!this.backgroundImageFile ? CDNMapper.hbthemes.assets(this.hbthemeId,
            "backgroundImage",
            "jpg",
            this.backgroundImageHash) : null;
    }

}