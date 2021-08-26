import {AfterLoad, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {LayoutEntity} from "../Layout.entity";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";

@Entity()
export class LayoutPreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => LayoutEntity, {onDelete: "CASCADE", cascade: true})
    @JoinColumn({name: "layoutId"})
    layout: LayoutEntity;

    @PrimaryColumn()
    layoutId: string;

    @AfterLoad()
    afterLoad() {
        if (!!this.image720File) {
            this.image720Url = CDNMapper.layouts.previews(this.layoutId, "720", "webp", this.cacheUUID);
        }
        if (!!this.image360File) {
            this.image360Url = CDNMapper.layouts.previews(this.layoutId, "360", "webp", this.cacheUUID);
        }
        if (!!this.image240File) {
            this.image240Url = CDNMapper.layouts.previews(this.layoutId, "240", "webp", this.cacheUUID);
        }
        if (!!this.image180File) {
            this.image180Url = CDNMapper.layouts.previews(this.layoutId, "180", "webp", this.cacheUUID);
        }
        if (!!this.imagePlaceholderFile) {
            this.imagePlaceholderUrl = CDNMapper.layouts.previews(this.layoutId, "placeholder", "webp", this.cacheUUID);
        }
    }

}