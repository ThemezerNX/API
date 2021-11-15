import {AfterLoad, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
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

    @AfterLoad()
    setUrls() {
        this.image720Url = !!this.image720Hash ? CDNMapper.packs.previews(this.packId,
            "720",
            "webp",
            this.image720Hash) : null;
        this.image360Url = !!this.image360Hash ? CDNMapper.packs.previews(this.packId,
            "360",
            "webp",
            this.image360Hash) : null;
        this.image240Url = !!this.image240Hash ? CDNMapper.packs.previews(this.packId,
            "240",
            "webp",
            this.image240Hash) : null;
        this.image180Url = !!this.image180Hash ? CDNMapper.packs.previews(this.packId,
            "180",
            "webp",
            this.image180Hash) : null;
        this.imagePlaceholderUrl = !!this.imagePlaceholderHash ? CDNMapper.packs.previews(this.packId,
            "placeholder",
            "webp",
            this.imagePlaceholderHash) : null;
    }

}