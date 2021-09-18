import {Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {LayoutOptionValueEntity} from "../OptionValue/LayoutOptionValue.entity";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";

@Entity()
export class LayoutOptionValuePreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => LayoutOptionValueEntity,
        layoutOptionValue => layoutOptionValue.previews,
        {onDelete: "CASCADE"})
    @JoinColumn({name: "layoutOptionValueUuid"})
    layoutOptionValue: LayoutOptionValueEntity;

    @PrimaryColumn({update: false})
    layoutOptionValueUuid: string;

    get image720Url() {
        return !!this.image720File ? CDNMapper.layoutOptions.previews(
            this.layoutOptionValueUuid,
            "720",
            "webp",
            this.cacheID) : null;
    }

    get image360Url() {
        return !!this.image360File ? CDNMapper.layoutOptions.previews(
            this.layoutOptionValueUuid,
            "360",
            "webp",
            this.cacheID) : null;
    }

    get image240Url() {
        return !!this.image240File ? CDNMapper.layoutOptions.previews(
            this.layoutOptionValueUuid,
            "240",
            "webp",
            this.cacheID) : null;
    }

    get image180Url() {
        return !!this.image180File ? CDNMapper.layoutOptions.previews(
            this.layoutOptionValueUuid,
            "180",
            "webp",
            this.cacheID) : null;
    }

    get imagePlaceholderUrl() {
        return !!this.imagePlaceholderFile ? CDNMapper.layoutOptions.previews(
            this.layoutOptionValueUuid,
            "placeholder",
            "webp",
            this.cacheID) : null;
    }

}