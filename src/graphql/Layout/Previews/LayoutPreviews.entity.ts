import {AfterLoad, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";
import {LayoutEntity} from "../Layout.entity";

@Entity()
export class LayoutPreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => LayoutEntity, layout => layout.previews, {onDelete: "CASCADE"})
    @JoinColumn({name: "layoutId"})
    layout: LayoutEntity;

    @PrimaryColumn({update: false})
    layoutId: string;

    @AfterLoad()
    setUrls() {
        this.image720Url = CDNMapper.layouts.previews(this.layoutId,
            "720",
            "webp",
            this.image720Hash);
        this.image360Url = CDNMapper.layouts.previews(this.layoutId,
            "360",
            "webp",
            this.image360Hash);
        this.image240Url = CDNMapper.layouts.previews(this.layoutId,
            "240",
            "webp",
            this.image240Hash);
        this.image180Url = CDNMapper.layouts.previews(this.layoutId,
            "180",
            "webp",
            this.image180Hash);
        this.imagePlaceholderUrl = CDNMapper.layouts.previews(this.layoutId,
            "placeholder",
            "webp",
            this.imagePlaceholderHash);
    }

}