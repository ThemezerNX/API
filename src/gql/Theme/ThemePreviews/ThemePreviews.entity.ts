import {BeforeUpdate, Column, Entity, Generated, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {v4 as uuid} from "uuid";
import {ThemeEntity} from "../Theme.entity";

@Entity()
export class ThemePreviewsEntity {

    @OneToOne(() => ThemeEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "themeId"})
    theme: ThemeEntity;

    @PrimaryColumn()
    themeId: string;

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

    @BeforeUpdate()
    randomizeUuid() {
        this.randomUuid = uuid();
    }

}