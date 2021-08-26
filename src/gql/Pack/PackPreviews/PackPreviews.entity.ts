import {AfterLoad, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";
import {PackEntity} from "../Pack.entity";

@Entity()
export class PackPreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => PackEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "packId"})
    pack: PackEntity;

    @PrimaryColumn()
    packId: string;

    @AfterLoad()
    afterLoad() {
        if (!!this.image720File) {
            this.image720Url = CDNMapper.packs.previews(this.packId, "720", "webp", this.cacheUUID);
        }
        if (!!this.image360File) {
            this.image360Url = CDNMapper.packs.previews(this.packId, "360", "webp", this.cacheUUID);
        }
        if (!!this.image240File) {
            this.image240Url = CDNMapper.packs.previews(this.packId, "240", "webp", this.cacheUUID);
        }
        if (!!this.image180File) {
            this.image180Url = CDNMapper.packs.previews(this.packId, "180", "webp", this.cacheUUID);
        }
        if (!!this.imagePlaceholderFile) {
            this.imagePlaceholderUrl = CDNMapper.packs.previews(this.packId, "placeholder", "webp", this.cacheUUID);
        }
    }

}