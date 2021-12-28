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
            LayoutPreviewsEntity.IMAGE_720_FILENAME,
            this.image720Hash);
        this.image360Url = CDNMapper.layouts.previews(this.layoutId,
            LayoutPreviewsEntity.IMAGE_720_FILENAME,
            this.image360Hash);
        this.image240Url = CDNMapper.layouts.previews(this.layoutId,
            LayoutPreviewsEntity.IMAGE_720_FILENAME,
            this.image240Hash);
        this.image180Url = CDNMapper.layouts.previews(this.layoutId,
            LayoutPreviewsEntity.IMAGE_720_FILENAME,
            this.image180Hash);
        this.imagePlaceholderUrl = CDNMapper.layouts.previews(this.layoutId,
            LayoutPreviewsEntity.IMAGE_720_FILENAME,
            this.imagePlaceholderHash);
    }

}