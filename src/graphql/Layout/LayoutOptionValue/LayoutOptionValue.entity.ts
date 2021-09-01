import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn} from "typeorm";
import {LayoutOptionValuePreviewsEntity} from "../LayoutOptionValuePreviews/LayoutOptionValuePreviews.entity";
import {LayoutOptionEntity} from "../LayoutOption/LayoutOption.entity";


@Entity()
export class LayoutOptionValueEntity extends BaseEntity {

    @ManyToOne(() => LayoutOptionEntity, layoutOption => layoutOption.values, {onDelete: "CASCADE"})
    @JoinColumn()
    layoutOption: LayoutOptionEntity;

    @PrimaryColumn("uuid")
    uuid: string;

    @Column("jsonb")
    json: string;

    @OneToOne(() => LayoutOptionValuePreviewsEntity,
        layoutOptionValuePreviews => layoutOptionValuePreviews.layoutOptionValue,
        {onDelete: "CASCADE", cascade: true, eager: true})
    previews: LayoutOptionValuePreviewsEntity;

}