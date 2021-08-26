import {AfterLoad, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {HBThemeEntity} from "../HBTheme.entity";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";

@Entity()
export class HBThemePreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => HBThemeEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "hbThemeId"})
    hbTheme: HBThemeEntity;

    @PrimaryColumn()
    hbThemeId: string;

    @AfterLoad()
    afterLoad() {
        if (!!this.image720File) {
            this.image720Url = CDNMapper.hbThemes.previews(this.hbThemeId, "720", "webp", this.cacheUUID);
        }
        if (!!this.image360File) {
            this.image360Url = CDNMapper.hbThemes.previews(this.hbThemeId, "360", "webp", this.cacheUUID);
        }
        if (!!this.image240File) {
            this.image240Url = CDNMapper.hbThemes.previews(this.hbThemeId, "240", "webp", this.cacheUUID);
        }
        if (!!this.image180File) {
            this.image180Url = CDNMapper.hbThemes.previews(this.hbThemeId, "180", "webp", this.cacheUUID);
        }
        if (!!this.imagePlaceholderFile) {
            this.imagePlaceholderUrl = CDNMapper.hbThemes.previews(this.hbThemeId,
                "placeholder",
                "webp",
                this.cacheUUID);
        }
    }

}