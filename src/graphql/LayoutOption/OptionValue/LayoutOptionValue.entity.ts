import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn} from "typeorm";
import {LayoutOptionValuePreviewsEntity} from "../OptionValuePreviews/LayoutOptionValuePreviews.entity";
import {LayoutOptionEntity} from "../LayoutOption.entity";
import {EntityWithPreviewsInterface} from "../../common/interfaces/EntityWithPreviews.interface";


@Entity()
export class LayoutOptionValueEntity extends BaseEntity implements EntityWithPreviewsInterface {

    @ManyToOne(() => LayoutOptionEntity, layoutOption => layoutOption.values, {onDelete: "CASCADE"})
    @JoinColumn({name: "layoutOptionId"})
    layoutOption: LayoutOptionEntity;

    @Column({type: "int"})
    layoutOptionId: number;

    @PrimaryColumn("uuid", {update: false})
    uuid: string;

    @Column()
    name: string;

    @Column("varchar")
    json: string;

    @OneToOne(() => LayoutOptionValuePreviewsEntity,
        layoutOptionValuePreviews => layoutOptionValuePreviews.layoutOptionValue,
        {nullable: true, onDelete: "CASCADE", cascade: true, eager: true})
    previews?: LayoutOptionValuePreviewsEntity;

}