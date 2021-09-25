import {Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";
import {LayoutEntity} from "../Layout.entity";

@Entity("layout_previews")
export class LayoutPreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => LayoutEntity, layout => layout.previews, {onDelete: "CASCADE"})
    @JoinColumn({name: "layoutId"})
    layout: LayoutEntity;

    @PrimaryColumn({update: false})
    layoutId: string;

    get image720Url() {
        return CDNMapper.layouts.previews(this.layoutId, "720", "webp", this.cacheId);
    }

    get image360Url() {
        return CDNMapper.layouts.previews(this.layoutId, "360", "webp", this.cacheId);
    }

    get image240Url() {
        return CDNMapper.layouts.previews(this.layoutId, "240", "webp", this.cacheId);
    }

    get image180Url() {
        return CDNMapper.layouts.previews(this.layoutId, "180", "webp", this.cacheId);
    }

    get imagePlaceholderUrl() {
        return CDNMapper.layouts.previews(this.layoutId, "placeholder", "webp", this.cacheId);
    }

}