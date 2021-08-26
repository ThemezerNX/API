import {AfterLoad, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {ObjectType} from "@nestjs/graphql";
import {LayoutOptionValueEntity} from "../LayoutOptionValue/LayoutOptionValue.entity";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";
import {LayoutEntity} from "../Layout.entity";

@ObjectType()
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

    @AfterLoad()
    afterLoad() {
        if (!!this.image720File) {
            this.image720Url = CDNMapper.layouts.options.previews(this.layoutId,
                this.layoutOptionValueUuid,
                "720",
                "webp",
                this.cacheUUID);
        }
        if (!!this.image360File) {
            this.image360Url = CDNMapper.layouts.options.previews(this.layoutId,
                this.layoutOptionValueUuid,
                "360",
                "webp",
                this.cacheUUID);
        }
        if (!!this.image240File) {
            this.image240Url = CDNMapper.layouts.options.previews(this.layoutId,
                this.layoutOptionValueUuid,
                "240",
                "webp",
                this.cacheUUID);
        }
        if (!!this.image180File) {
            this.image180Url = CDNMapper.layouts.options.previews(this.layoutId,
                this.layoutOptionValueUuid,
                "180",
                "webp",
                this.cacheUUID);
        }
        if (!!this.imagePlaceholderFile) {
            this.imagePlaceholderUrl = CDNMapper.layouts.options.previews(this.layoutId,
                this.layoutOptionValueUuid,
                "placeholder",
                "webp",
                this.cacheUUID);
        }
    }

}