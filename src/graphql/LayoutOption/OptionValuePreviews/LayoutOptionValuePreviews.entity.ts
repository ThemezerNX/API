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
        return CDNMapper.layoutOptions.previews(this.layoutOptionValueUUID, "720", "webp", this.image720Hash);
    }

    get image360Url() {
        return CDNMapper.layoutOptions.previews(this.layoutOptionValueUUID, "360", "webp", this.image360Hash);
    }

    get image240Url() {
        return CDNMapper.layoutOptions.previews(this.layoutOptionValueUUID, "240", "webp", this.image240Hash);
    }

    get image180Url() {
        return CDNMapper.layoutOptions.previews(this.layoutOptionValueUUID, "180", "webp", this.image180Hash);
    }

    get imagePlaceholderUrl() {
        return CDNMapper.layoutOptions.previews(this.layoutOptionValueUUID, "placeholder", "webp", this.imagePlaceholderHash);
    }

}