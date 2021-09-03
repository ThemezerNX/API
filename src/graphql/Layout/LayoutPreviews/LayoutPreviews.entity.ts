import {Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {LayoutEntity} from "../Layout.entity";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";

@Entity()
export class LayoutPreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => LayoutEntity, layout => layout.previews, {onDelete: "CASCADE"})
    @JoinColumn({name: "layoutId"})
    layout: LayoutEntity;

    @PrimaryColumn({update: false})
    layoutId: string;

    get image720Url() {
        return !!this.image720File ? CDNMapper.layouts.previews(this.layoutId, "720", "webp", this.cacheID) : null;
    }

    get image360Url() {
        return !!this.image360File ? CDNMapper.layouts.previews(this.layoutId, "360", "webp", this.cacheID) : null;
    }

    get image240Url() {
        return !!this.image240File ? CDNMapper.layouts.previews(this.layoutId, "240", "webp", this.cacheID) : null;
    }

    get image180Url() {
        return !!this.image180File ? CDNMapper.layouts.previews(this.layoutId, "180", "webp", this.cacheID) : null;
    }

    get imagePlaceholderUrl() {
        return !!this.imagePlaceholderFile ? CDNMapper.layouts.previews(this.layoutId,
            "placeholder",
            "webp",
            this.cacheID) : null;
    }

}