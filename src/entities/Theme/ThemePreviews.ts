import {Column, Entity, Generated, JoinColumn, PrimaryColumn} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {URL} from "graphql-scalars/mocks";

@ObjectType()
@Entity()
export class ThemePreviews {

    @PrimaryColumn()
    @JoinColumn()
    themeId: string;

    @Generated("uuid")
    uuid: string;

    @Column("bytea", {nullable: false})
    image720File: any;

    @Field(() => URL)
    get image720(): string {
        return `//cdn.themezer.net/themes/${this.themeId}/${this.uuid}/720`;
    }

    @Column("bytea", {nullable: false})
    image360File: any;

    @Field(() => URL)
    get image360(): string {
        return `//cdn.themezer.net/themes/${this.themeId}/${this.uuid}/360`;
    }

    @Column("bytea", {nullable: false})
    image240File: any;

    @Field(() => URL)
    get image240(): string {
        return `//cdn.themezer.net/themes/${this.themeId}/${this.uuid}/240`;
    }

    @Column("bytea", {nullable: false})
    image180File: any;

    @Field(() => URL)
    get image180(): string {
        return `//cdn.themezer.net/themes/${this.themeId}/${this.uuid}/180`;
    }

    @Column("bytea", {nullable: false})
    imagePlaceholderFile: any;

    @Field(() => URL)
    get imagePlaceholder(): string {
        return `//cdn.themezer.net/themes/${this.themeId}/${this.uuid}/placeholder`;
    }

}