import {AfterLoad, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {ThemeEntity} from "../Theme.entity";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";

@Entity()
export class ThemePreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => ThemeEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "themeId"})
    theme: ThemeEntity;

    @PrimaryColumn()
    themeId: string;

    @AfterLoad()
    afterLoad() {
        if (!!this.image720File) {
            this.image720Url = CDNMapper.themes.previews(this.themeId, "720", "webp", this.cacheUUID);
        }
        if (!!this.image360File) {
            this.image360Url = CDNMapper.themes.previews(this.themeId, "360", "webp", this.cacheUUID);
        }
        if (!!this.image240File) {
            this.image240Url = CDNMapper.themes.previews(this.themeId, "240", "jpg", this.cacheUUID);
        }
        if (!!this.image180File) {
            this.image180Url = CDNMapper.themes.previews(this.themeId, "180", "webp", this.cacheUUID);
        }
        if (!!this.imagePlaceholderFile) {
            this.imagePlaceholderUrl = CDNMapper.themes.previews(this.themeId, "placeholder", "webp", this.cacheUUID);
        }
    }

}