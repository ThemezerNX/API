import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {LayoutOptionValuePreviewsEntity} from "../LayoutOptionValuePreviews/LayoutOptionValuePreviews.entity";
import {LayoutOptionEntity} from "../LayoutOption/LayoutOption.entity";


@Entity()
export class LayoutOptionValueEntity extends BaseEntity {

    @ManyToOne(() => LayoutOptionEntity, {onDelete: "CASCADE", cascade: true})
    @JoinColumn()
    layoutOption: LayoutOptionEntity;

    @PrimaryColumn("uuid")
    uuid: string;

    @Column("jsonb")
    json: string;

    @JoinColumn()
    previews: LayoutOptionValuePreviewsEntity;

}