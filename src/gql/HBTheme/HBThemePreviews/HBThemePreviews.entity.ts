import {BeforeUpdate, Column, Entity, Generated, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {v4 as uuid} from "uuid";
import {HBThemeEntity} from "../HBTheme.entity";

@Entity()
export class HBThemePreviewsEntity {

    @OneToOne(() => HBThemeEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "hbThemeId"})
    hbTheme: HBThemeEntity;

    @PrimaryColumn()
    hbThemeId: string;

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