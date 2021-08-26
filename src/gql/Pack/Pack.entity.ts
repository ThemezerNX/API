import {Column, Entity, OneToOne} from "typeorm";
import {ItemEntityInterface} from "../common/interfaces/Item.entity.interface";
import {PackPreviewsEntity} from "./PackPreviews/PackPreviews.entity";

@Entity()
export class PackEntity extends ItemEntityInterface {

    @Column()
    isNSFW: boolean;

    @OneToOne(() => PackPreviewsEntity, packPreviews => packPreviews.pack, {cascade: true, eager: true})
    previews: PackPreviewsEntity;

}