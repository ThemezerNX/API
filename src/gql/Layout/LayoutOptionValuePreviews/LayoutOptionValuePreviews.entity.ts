import {Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {LayoutOptionValueEntity} from "../LayoutOptionValue/LayoutOptionValue.entity";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";
import {LayoutEntity} from "../Layout.entity";

@Entity()
export class LayoutOptionValuePreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => LayoutEntity, {onDelete: "CASCADE", cascade: true})
    @JoinColumn({name: "layoutId"})
    layout: LayoutEntity;

    @PrimaryColumn()
    layoutId: string;

    @OneToOne(() => LayoutOptionValueEntity, {onDelete: "CASCADE", cascade: true})
    @JoinColumn({name: "layoutOptionValueUuid"})
    layoutOptionValue: LayoutOptionValueEntity;

    @PrimaryColumn()
    layoutOptionValueUuid: string;

    get image720Url() {
        return !!this.image720File ? CDNMapper.layouts.options.previews(this.layoutId,
            this.layoutOptionValueUuid,
            "720",
            "webp",
            this.cacheID) : null;
    }

    get image360Url() {
        return !!this.image360File ? CDNMapper.layouts.options.previews(this.layoutId,
            this.layoutOptionValueUuid,
            "360",
            "webp",
            this.cacheID) : null;
    }

    get image240Url() {
        return !!this.image240File ? CDNMapper.layouts.options.previews(this.layoutId,
            this.layoutOptionValueUuid,
            "240",
            "webp",
            this.cacheID) : null;
    }

    get image180Url() {
        return !!this.image180File ? CDNMapper.layouts.options.previews(this.layoutId,
            this.layoutOptionValueUuid,
            "180",
            "webp",
            this.cacheID) : null;
    }

    get imagePlaceholderUrl() {
        return !!this.imagePlaceholderFile ? CDNMapper.layouts.options.previews(this.layoutId,
            this.layoutOptionValueUuid,
            "placeholder",
            "webp",
            this.cacheID) : null;
    }

}