import {BeforeUpdate, Column, Entity, Generated, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {ObjectType} from "@nestjs/graphql";
import {v4 as uuid} from "uuid";
import {LayoutOptionValueEntity} from "../LayoutOptionValue/LayoutOptionValue.entity";

@ObjectType()
@Entity()
export class LayoutOptionValuePreviewsEntity {

    @OneToOne(() => LayoutOptionValueEntity, {onDelete: "CASCADE", cascade: true})
    @JoinColumn({name: "layoutOptionValueUuid"})
    layoutOptionValue: LayoutOptionValueEntity;

    @PrimaryColumn()
    layoutOptionValueUuid: string;

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