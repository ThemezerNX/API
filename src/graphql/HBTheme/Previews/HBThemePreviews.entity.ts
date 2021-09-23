import {Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {HBThemeEntity} from "../HBTheme.entity";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";

@Entity()
export class HBThemePreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => HBThemeEntity, hbthemeEntity => hbthemeEntity.previews,{onDelete: "CASCADE"})
    @JoinColumn({name: "hbthemeId"})
    hbtheme: HBThemeEntity;

    @PrimaryColumn({update: false})
    hbthemeId: string;

    get image720Url() {
        return !!this.image720File ? CDNMapper.hbthemes.previews(this.hbthemeId, "720", "webp", this.cacheId) : null;
    }

    get image360Url() {
        return !!this.image360File ? CDNMapper.hbthemes.previews(this.hbthemeId, "360", "webp", this.cacheId) : null;
    }

    get image240Url() {
        return !!this.image240File ? CDNMapper.hbthemes.previews(this.hbthemeId, "240", "webp", this.cacheId) : null;
    }

    get image180Url() {
        return !!this.image180File ? CDNMapper.hbthemes.previews(this.hbthemeId, "180", "webp", this.cacheId) : null;
    }

    get imagePlaceholderUrl() {
        return !!this.imagePlaceholderFile ? CDNMapper.hbthemes.previews(this.hbthemeId,
            "placeholder",
            "webp",
            this.cacheId) : null;
    }

}