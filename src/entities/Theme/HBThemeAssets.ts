import {BeforeUpdate, Column, Entity, Generated, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {v4 as uuid} from "uuid";
import {HBTheme} from "./HBTheme";
import {URLResolver} from "graphql-scalars";

@ObjectType()
@Entity()
export class HBThemeAssets {

    @OneToOne(() => HBTheme, {onDelete: "CASCADE", cascade: true})
    @JoinColumn({name: "hbThemeId"})
    hbTheme: HBTheme;

    @PrimaryColumn()
    hbThemeId: string;

    @Generated("uuid")
    randomUuid: string;

    @Column("bytea")
    batteryIconFile: any;
    @Column("bytea")
    chargingIconFile: any;
    @Column("bytea")
    folderIconFile: any;
    @Column("bytea")
    invalidIconFile: any;
    @Column("bytea")
    themeIconDarkFile: any;
    @Column("bytea")
    themeIconLightFile: any;
    @Column("bytea")
    airplaneIconFile: any;
    @Column("bytea")
    wifiNoneIconFile: any;
    @Column("bytea")
    wifi1IconFile: any;
    @Column("bytea")
    wifi2IconFile: any;
    @Column("bytea")
    wifi3IconFile: any;
    @Column("bytea")
    ethIconFile: any;
    @Column("bytea")
    backgroundImageFile: any;

    @Field(() => URLResolver, {nullable: true})
    get batteryIcon(): string {
        return this.batteryIconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/batteryIcon` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get chargingIcon(): string {
        return this.chargingIconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/chargingIcon` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get folderIcon(): string {
        return this.folderIconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/folderIcon` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get invalidIcon(): string {
        return this.invalidIconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/invalidIcon` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get themeIconDark(): string {
        return this.themeIconDarkFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/themeIconDark` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get themeIconLight(): string {
        return this.themeIconLightFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/themeIconLight` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get airplaneIcon(): string {
        return this.airplaneIconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/airplaneIcon` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get wifiNoneIcon(): string {
        return this.wifiNoneIconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/wifiNoneIcon` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get wifi1Icon(): string {
        return this.wifi1IconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/wifi1Icon` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get wifi2Icon(): string {
        return this.wifi2IconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/wifi2Icon` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get wifi3Icon(): string {
        return this.wifi3IconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/wifi3Icon` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get ethIcon(): string {
        return this.ethIconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/ethIcon` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get backgroundImage(): string {
        return this.backgroundImageFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/backgroundImage` : null;
    }

    @BeforeUpdate()
    randomizeUuid() {
        this.randomUuid = uuid();
    }

}