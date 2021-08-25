import {BeforeUpdate, Column, Entity, Generated, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {v4 as uuid} from "uuid";
import {LayoutEntity} from "../Layout.entity";

@Entity()
export class LayoutPreviewsEntity {

    @OneToOne(() => LayoutEntity, {onDelete: "CASCADE", cascade: true})
    @JoinColumn({name: "layoutId"})
    layout: LayoutEntity;

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

    @BeforeUpdate()
    randomizeUuid() {
        this.randomUuid = uuid();
    }

}