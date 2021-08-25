import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {Target} from "../../common/enums/Target";
import {LayoutOptionValuePreviewsEntity} from "../LayoutOptionValuePreviews/LayoutOptionValuePreviews.entity";
import {LayoutOptionEntity} from "../LayoutOption/LayoutOption.entity";


@Entity()
export class LayoutOptionValueEntity extends BaseEntity {

    @ManyToOne(() => LayoutOptionEntity, {onDelete: "CASCADE", cascade: true})
    @JoinColumn()
    layoutOption: LayoutOptionEntity;

    @PrimaryColumn("uuid")
    uuid: string;

    @Column({
        type: "enum",
        enum: Target,
    })
    target: Target;

    @Column("jsonb")
    json: string;

    @JoinColumn()
    previews: LayoutOptionValuePreviewsEntity;

}