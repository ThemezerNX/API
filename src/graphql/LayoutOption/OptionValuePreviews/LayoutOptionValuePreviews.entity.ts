import {Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {LayoutOptionValueEntity} from "../OptionValue/LayoutOptionValue.entity";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";

@Entity("layout_option_value_previews")
export class LayoutOptionValuePreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => LayoutOptionValueEntity,
        layoutOptionValue => layoutOptionValue.previews,
        {onDelete: "CASCADE"})
    @JoinColumn({name: "layoutOptionValueUUID"})
    layoutOptionValue: LayoutOptionValueEntity;

    @PrimaryColumn({update: false})
    layoutOptionValueUUID: string;

    get image720Url() {
        return CDNMapper.layoutOptions.previews(this.layoutOptionValueUUID, "720", "webp", this.cacheId);
    }

    get image360Url() {
        return CDNMapper.layoutOptions.previews(this.layoutOptionValueUUID, "360", "webp", this.cacheId);
    }

    get image240Url() {
        return CDNMapper.layoutOptions.previews(this.layoutOptionValueUUID, "240", "webp", this.cacheId);
    }

    get image180Url() {
        return CDNMapper.layoutOptions.previews(this.layoutOptionValueUUID, "180", "webp", this.cacheId);
    }

    get imagePlaceholderUrl() {
        return CDNMapper.layoutOptions.previews(this.layoutOptionValueUUID, "placeholder", "webp", this.cacheId);
    }

}