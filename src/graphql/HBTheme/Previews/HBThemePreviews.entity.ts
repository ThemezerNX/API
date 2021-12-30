import {AfterLoad, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {HBThemeEntity} from "../HBTheme.entity";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";

@Entity()
export class HBThemePreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => HBThemeEntity, hbthemeEntity => hbthemeEntity.previews, {onDelete: "CASCADE"})
    @JoinColumn({name: "hbthemeId"})
    hbtheme: HBThemeEntity;

    @PrimaryColumn({update: false})
    hbthemeId: string;

    @AfterLoad()
    setUrls() {
        this.image720Url = CDNMapper.hbthemes.previews(this.hbthemeId,
            HBThemePreviewsEntity.IMAGE_720_FILENAME,
            this.image720Hash);
        this.image360Url = CDNMapper.hbthemes.previews(this.hbthemeId,
            HBThemePreviewsEntity.IMAGE_360_FILENAME,
            this.image360Hash);
        this.image240Url = CDNMapper.hbthemes.previews(this.hbthemeId,
            HBThemePreviewsEntity.IMAGE_240_FILENAME,
            this.image240Hash);
        this.image180Url = CDNMapper.hbthemes.previews(this.hbthemeId,
            HBThemePreviewsEntity.IMAGE_180_FILENAME,
            this.image180Hash);
        this.imagePlaceholderUrl = CDNMapper.hbthemes.previews(this.hbthemeId,
            HBThemePreviewsEntity.IMAGE_720_FILENAME,
            this.imagePlaceholderHash);
    }

}