import {AfterLoad, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {ThemeEntity} from "../Theme.entity";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";
import {ReadStream} from "fs";
import {generateImages} from "../../common/processors/ScreenshotProcessor";

@Entity()
export class ThemePreviewsEntity extends PreviewsEntityInterface {

    static IMAGE_240_FILENAME = "240.jpg";

    @OneToOne(() => ThemeEntity, themeEntity => themeEntity.previews, {onDelete: "CASCADE"})
    @JoinColumn({name: "themeId"})
    theme: ThemeEntity;

    @PrimaryColumn({update: false})
    themeId: string;

    @AfterLoad()
    setUrls() {
        this.image720Url = CDNMapper.themes.previews(this.themeId,
            ThemePreviewsEntity.IMAGE_720_FILENAME,
            this.image720Hash);
        this.image360Url = CDNMapper.themes.previews(this.themeId,
            ThemePreviewsEntity.IMAGE_360_FILENAME,
            this.image360Hash);
        this.image240Url = CDNMapper.themes.previews(this.themeId,
            ThemePreviewsEntity.IMAGE_240_FILENAME,
            this.image240Hash);
        this.image180Url = CDNMapper.themes.previews(this.themeId,
            ThemePreviewsEntity.IMAGE_180_FILENAME,
            this.image180Hash);
    }

    async generateFromStream(createReadStream: () => ReadStream) {
        this.assignImages(await generateImages(createReadStream, true));
    }

}