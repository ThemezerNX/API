import {BaseEntity, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {LayoutOptionValueEntity} from "../LayoutOptionValue/LayoutOptionValue.entity";
import {LayoutEntity} from "../Layout.entity";


@Entity()
export class LayoutOptionEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => LayoutEntity, layout => layout.options, {onDelete: "CASCADE"})
    @JoinColumn()
    layout: LayoutEntity;

    @OneToMany(() => LayoutOptionValueEntity, layoutOptionValue => layoutOptionValue.layoutOption, {cascade: true, eager: true})
    values: LayoutOptionValueEntity[];

}