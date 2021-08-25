import {BeforeUpdate, Column, Entity, Generated, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {v4 as uuid} from "uuid";
import {HBThemeEntity} from "../HBTheme.entity";

@Entity()
export class HBThemeAssetsEntity {

    @OneToOne(() => HBThemeEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "hbThemeId"})
    hbTheme: HBThemeEntity;

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

    @BeforeUpdate()
    randomizeUuid() {
        this.randomUuid = uuid();
    }

}