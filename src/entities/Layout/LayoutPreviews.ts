import {BeforeUpdate, Column, Entity, Generated, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {Layout} from "./Layout";
import {v4 as uuid} from "uuid";
import {URLResolver} from "graphql-scalars";

@ObjectType()
@Entity()
export class LayoutPreviews {

    @OneToOne(() => Layout, {onDelete: "CASCADE", cascade: true})
    @JoinColumn({name: "layoutId"})
    layout: Layout;

    @PrimaryColumn()
    layoutId: string;

    @Generated("uuid")
    randomUuid: string;

    @Column("bytea")
    image720File: any;
    @Column("bytea")
    image360File: any;
    @Column("bytea")
    image240File: any;
    @Column("bytea")
    image180File: any;
    @Column("bytea")
    imagePlaceholderFile: any;

    @Field(() => URLResolver, {description: "WebP image, 1280x720"})
    get image720(): string {
        return `//cdn.themezer.net/layouts/${this.layoutId}/${this.randomUuid}/previews/720`;
    }

    @Field(() => URLResolver, {description: "WebP image, 640x360"})
    get image360(): string {
        return `//cdn.themezer.net/layouts/${this.layoutId}/${this.randomUuid}/previews/360`;
    }

    @Field(() => URLResolver, {description: "WebP image, 426x240"})
    get image240(): string {
        return `//cdn.themezer.net/layouts/${this.layoutId}/${this.randomUuid}/previews/240`;
    }

    @Field(() => URLResolver, {description: "WebP image, 320x180"})
    get image180(): string {
        return `//cdn.themezer.net/layouts/${this.layoutId}/${this.randomUuid}/previews/180`;
    }

    @Field(() => URLResolver, {description: "WebP image, 80x45"})
    get imagePlaceholder(): string {
        return `//cdn.themezer.net/layouts/${this.layoutId}/${this.randomUuid}/previews/placeholder`;
    }

    @BeforeUpdate()
    randomizeUuid() {
        this.randomUuid = uuid();
    }

}