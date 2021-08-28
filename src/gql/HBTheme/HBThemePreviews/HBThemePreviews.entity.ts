import {Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {HBThemeEntity} from "../HBTheme.entity";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";

@Entity()
export class HBThemePreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => HBThemeEntity, hbThemeEntity => hbThemeEntity.previews,{onDelete: "CASCADE"})
    @JoinColumn({name: "hbThemeId"})
    hbTheme: HBThemeEntity;

    @PrimaryColumn()
    hbThemeId: string;

    get image720Url() {
        return !!this.image720File ? CDNMapper.hbThemes.previews(this.hbThemeId, "720", "webp", this.cacheID) : null;
    }

    get image360Url() {
        return !!this.image360File ? CDNMapper.hbThemes.previews(this.hbThemeId, "360", "webp", this.cacheID) : null;
    }

    get image240Url() {
        return !!this.image240File ? CDNMapper.hbThemes.previews(this.hbThemeId, "240", "webp", this.cacheID) : null;
    }

    get image180Url() {
        return !!this.image180File ? CDNMapper.hbThemes.previews(this.hbThemeId, "180", "webp", this.cacheID) : null;
    }

    get imagePlaceholderUrl() {
        return !!this.imagePlaceholderFile ? CDNMapper.hbThemes.previews(this.hbThemeId,
            "placeholder",
            "webp",
            this.cacheID) : null;
    }

}