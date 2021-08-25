import {BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {LayoutOptionValueEntity} from "../LayoutOptionValue/LayoutOptionValue.entity";
import {LayoutEntity} from "../Layout.entity";


@Entity()
export class LayoutOptionEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => LayoutEntity, {onDelete: "CASCADE", cascade: true})
    @JoinColumn()
    layout: LayoutEntity;

    @JoinColumn()
    values: LayoutOptionValueEntity[];

}