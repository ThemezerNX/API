import {Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";
import {PackEntity} from "../Pack.entity";

@Entity()
export class PackPreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => PackEntity, pack => pack.previews, {onDelete: "CASCADE"})
    @JoinColumn({name: "packId"})
    pack: PackEntity;

    @PrimaryColumn({update: false})
    packId: string;

    get image720Url() {
        return !!this.image720File ? CDNMapper.packs.previews(this.packId, "720", "webp", this.cacheId) : null;
    }

    get image360Url() {
        return !!this.image360File ? CDNMapper.packs.previews(this.packId, "360", "webp", this.cacheId) : null;
    }

    get image240Url() {
        return !!this.image240File ? CDNMapper.packs.previews(this.packId, "240", "webp", this.cacheId) : null;
    }

    get image180Url() {
        return !!this.image180File ? CDNMapper.packs.previews(this.packId, "180", "webp", this.cacheId) : null;
    }

    get imagePlaceholderUrl() {
        return !!this.imagePlaceholderFile ? CDNMapper.packs.previews(this.packId,
            "placeholder",
            "webp",
            this.cacheId) : null;
    }

}