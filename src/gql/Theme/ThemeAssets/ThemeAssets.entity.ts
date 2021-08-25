import {BeforeUpdate, Column, Entity, Generated, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {v4 as uuid} from "uuid";
import {ThemeEntity} from "../Theme.entity";

@Entity()
export class ThemeAssetsEntity {

    @OneToOne(() => ThemeEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "themeId"})
    theme: ThemeEntity;

    @PrimaryColumn()
    themeId: string;

    @Generated("uuid")
    randomUuid: string;

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

    @BeforeUpdate()
    randomizeUuid() {
        this.randomUuid = uuid();
    }

}