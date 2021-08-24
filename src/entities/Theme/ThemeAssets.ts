import {BeforeUpdate, Column, Entity, Generated, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {Theme} from "./Theme";
import {v4 as uuid} from "uuid";
import {JSONResolver, URLResolver} from "graphql-scalars";

@ObjectType()
@Entity()
export class ThemeAssets {

    @OneToOne(() => Theme, {onDelete: "CASCADE", cascade: true})
    @JoinColumn({name: "themeId"})
    theme: Theme;

    @PrimaryColumn()
    themeId: string;

    @Generated("uuid")
    randomUuid: string;

    @Field(() => JSONResolver, { nullable: true })
    @Column("jsonb", {nullable: true})
    customLayoutJson?: JSON;

    @Field(() => JSONResolver, { nullable: true })
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

    @Field(() => URLResolver, {nullable: true})
    get image(): string {
        return this.imageFile ? `//cdn.themezer.net/themes/${this.themeId}/${this.randomUuid}/assets/image` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get albumIcon(): string {
        return this.albumIconFile ? `//cdn.themezer.net/themes/${this.themeId}/${this.randomUuid}/assets/albumIcon` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get newsIcon(): string {
        return this.newsIconFile ? `//cdn.themezer.net/themes/${this.themeId}/${this.randomUuid}/assets/newsIcon` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get shopIcon(): string {
        return this.shopIconFile ? `//cdn.themezer.net/themes/${this.themeId}/${this.randomUuid}/assets/shopIcon` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get controllerIcon(): string {
        return this.controllerIconFile ? `//cdn.themezer.net/themes/${this.themeId}/${this.randomUuid}/assets/controllerIcon` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get settingsIcon(): string {
        return this.settingsIconFile ? `//cdn.themezer.net/themes/${this.themeId}/${this.randomUuid}/assets/settingsIcon` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get powerIcon(): string {
        return this.powerIconFile ? `//cdn.themezer.net/themes/${this.themeId}/${this.randomUuid}/assets/powerIcon` : null;
    }

    @Field(() => URLResolver, {nullable: true})
    get homeIcon(): string {
        return this.homeIconFile ? `//cdn.themezer.net/themes/${this.themeId}/${this.randomUuid}/assets/homeIcon` : null;
    }

    @BeforeUpdate()
    randomizeUuid() {
        this.randomUuid = uuid();
    }

}