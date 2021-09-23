import {Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {LayoutOptionValueEntity} from "../OptionValue/LayoutOptionValue.entity";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";

@Entity()
export class LayoutOptionValuePreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => LayoutOptionValueEntity,
        layoutOptionValue => layoutOptionValue.previews,
        {onDelete: "CASCADE"})
    @JoinColumn({name: "layoutOptionValueUUID"})
    layoutOptionValue: LayoutOptionValueEntity;

    @PrimaryColumn({update: false})
    layoutOptionValueUUID: string;

    get image720Url() {
        return !!this.image720File ? CDNMapper.layoutOptions.previews(
            this.layoutOptionValueUUID,
            "720",
            "webp",
            this.cacheId) : null;
    }

    get image360Url() {
        return !!this.image360File ? CDNMapper.layoutOptions.previews(
            this.layoutOptionValueUUID,
            "360",
            "webp",
            this.cacheId) : null;
    }

    get image240Url() {
        return !!this.image240File ? CDNMapper.layoutOptions.previews(
            this.layoutOptionValueUUID,
            "240",
            "webp",
            this.cacheId) : null;
    }

    get image180Url() {
        return !!this.image180File ? CDNMapper.layoutOptions.previews(
            this.layoutOptionValueUUID,
            "180",
            "webp",
            this.cacheId) : null;
    }

    get imagePlaceholderUrl() {
        return !!this.imagePlaceholderFile ? CDNMapper.layoutOptions.previews(
            this.layoutOptionValueUUID,
            "placeholder",
            "webp",
            this.cacheId) : null;
    }

}