import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {LayoutOptionValueEntity} from "./OptionValue/LayoutOptionValue.entity";
import {LayoutEntity} from "../Layout/Layout.entity";
import {LayoutOptionType} from "./common/LayoutOptionType.enum";


@Entity()
export class LayoutOptionEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar"})
    name: string;

    @Column({
        type: "enum",
        enum: LayoutOptionType,
        update: false,
    })
    type: LayoutOptionType;

    @Column()
    order: number;

    @ManyToOne(() => LayoutEntity, layout => layout.options, {onDelete: "CASCADE", nullable: true})
    @JoinColumn({name: "layoutId"})
    layout?: LayoutEntity;

    @Column({update: false, nullable: true, comment: "If NULL, the option is available for all layouts"})
    layoutId?: string;

    @OneToMany(() => LayoutOptionValueEntity,
        layoutOptionValue => layoutOptionValue.layoutOption,
        {cascade: true, eager: true})
    values: LayoutOptionValueEntity[];

}