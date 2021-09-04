import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn} from "typeorm";
import {LayoutOptionValuePreviewsEntity} from "../OptionValuePreviews/LayoutOptionValuePreviews.entity";
import {LayoutOptionEntity} from "../Option/LayoutOption.entity";


@Entity()
export class LayoutOptionValueEntity extends BaseEntity {

    @ManyToOne(() => LayoutOptionEntity, layoutOption => layoutOption.values, {onDelete: "CASCADE"})
    @JoinColumn()
    layoutOption: LayoutOptionEntity;

    @PrimaryColumn("uuid", {update: false})
    uuid: string;

    @Column("jsonb")
    json: string;

    @OneToOne(() => LayoutOptionValuePreviewsEntity,
        layoutOptionValuePreviews => layoutOptionValuePreviews.layoutOptionValue,
        {onDelete: "CASCADE", cascade: true, eager: true})
    previews: LayoutOptionValuePreviewsEntity;

}