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
        return !!this.image720File ? CDNMapper.themes.previews(this.themeId, "720", "webp", this.cacheId) : null;
    }

    get image360Url() {
        return !!this.image360File ? CDNMapper.themes.previews(this.themeId, "360", "webp", this.cacheId) : null;
    }

    get image240Url() {
        return !!this.image240File ? CDNMapper.themes.previews(this.themeId, "240", "jpg", this.cacheId) : null;
    }

    get image180Url() {
        return !!this.image180File ? CDNMapper.themes.previews(this.themeId, "180", "webp", this.cacheId) : null;
    }

    get imagePlaceholderUrl() {
        return !!this.imagePlaceholderFile ? CDNMapper.themes.previews(this.themeId,
            "placeholder",
            "webp",
            this.cacheId) : null;
    }

}