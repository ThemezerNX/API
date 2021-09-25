import {Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {ThemeEntity} from "../Theme.entity";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";

@Entity()
export class ThemePreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => ThemeEntity, themeEntity => themeEntity.previews, {onDelete: "CASCADE"})
    @JoinColumn({name: "themeId"})
    theme: ThemeEntity;

    @PrimaryColumn({update: false})
    themeId: string;

    get image720Url() {
        return CDNMapper.themes.previews(this.themeId, "720", "webp", this.cacheId);
    }

    get image360Url() {
        return CDNMapper.themes.previews(this.themeId, "360", "webp", this.cacheId);
    }

    get image240Url() {
        return CDNMapper.themes.previews(this.themeId, "240", "jpg", this.cacheId);
    }

    get image180Url() {
        return CDNMapper.themes.previews(this.themeId, "180", "webp", this.cacheId);
    }

    get imagePlaceholderUrl() {
        return CDNMapper.themes.previews(this.themeId, "placeholder", "webp", this.cacheId);
    }

}