import {Entity, OneToOne} from "typeorm";
import {ItemEntityInterface} from "../common/interfaces/Item.entity.interface";
import {PackPreviewsEntity} from "./PackPreviews/PackPreviews.entity";

@Entity()
export class PackEntity extends ItemEntityInterface {

    get isNSFW(): undefined {
        return;
    };

    @OneToOne(() => PackPreviewsEntity, packPreviews => packPreviews.pack, {cascade: true, eager: true})
    previews: PackPreviewsEntity;

    get themes(): undefined {
        return;
    };

}