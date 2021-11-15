import {AfterLoad, Entity, OneToMany, OneToOne} from "typeorm";
import {ItemEntityInterface} from "../common/interfaces/Item.entity.interface";
import {PackPreviewsEntity} from "./Previews/PackPreviews.entity";
import {ThemeEntity} from "../Theme/Theme.entity";
import {HBThemeEntity} from "../HBTheme/HBTheme.entity";
import {CDNMapper} from "../common/CDNMapper";
import {EntityWithPreviewsInterface} from "../common/interfaces/EntityWithPreviews.interface";

@Entity()
export class PackEntity extends ItemEntityInterface implements EntityWithPreviewsInterface {

    // Virtual field
    isNSFW: boolean;

    @OneToOne(() => PackPreviewsEntity, packPreviews => packPreviews.pack, {cascade: true, eager: true})
    previews: PackPreviewsEntity;

    @OneToMany(() => ThemeEntity, theme => theme.pack, {onDelete: "CASCADE"})
    themes: ThemeEntity[];

    @OneToMany(() => HBThemeEntity, hbtheme => hbtheme.pack, {onDelete: "CASCADE"})
    hbthemes: HBThemeEntity[];

    downloadUrl: string;

    @AfterLoad()
    setUrls() {
        this.downloadUrl = CDNMapper.packs.download(this.id);
    }

}