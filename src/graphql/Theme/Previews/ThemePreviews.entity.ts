import {AfterLoad, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
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

    @AfterLoad()
    setUrls() {
        this.image720Url = CDNMapper.themes.previews(this.themeId,
            "720",
            "webp",
            this.image720Hash);
        this.image360Url = CDNMapper.themes.previews(this.themeId,
            "360",
            "webp",
            this.image360Hash);
        this.image240Url = CDNMapper.themes.previews(this.themeId,
            "240",
            "jpg",
            this.image240Hash);
        this.image180Url = CDNMapper.themes.previews(this.themeId,
            "180",
            "webp",
            this.image180Hash);
        this.imagePlaceholderUrl = CDNMapper.themes.previews(this.themeId,
            "placeholder",
            "webp",
            this.imagePlaceholderHash);
    }

}