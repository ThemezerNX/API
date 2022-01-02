import {AfterLoad, Column, Entity, OneToMany, OneToOne} from "typeorm";
import {ItemEntityInterface} from "../common/interfaces/Item.entity.interface";
import {PackPreviewsEntity} from "./Previews/PackPreviews.entity";
import {ThemeEntity} from "../Theme/Theme.entity";
import {HBThemeEntity} from "../HBTheme/HBTheme.entity";
import {CDNMapper} from "../common/CDNMapper";
import {EntityWithPreviewsInterface} from "../common/interfaces/EntityWithPreviews.interface";
import {WebsiteMappings} from "../common/WebsiteMappings";
import {SelectAlways} from "perch-query-builder";

@Entity()
export class PackEntity extends ItemEntityInterface implements EntityWithPreviewsInterface {

    @Column({type: "boolean", default: false})
    isNSFW: boolean = false;

    @OneToOne(() => PackPreviewsEntity, packPreviews => packPreviews.pack, {cascade: true, eager: true})
    previews: PackPreviewsEntity;

    @OneToMany(() => ThemeEntity, theme => theme.pack, {onDelete: "CASCADE"})
    themes: ThemeEntity[];

    @OneToMany(() => HBThemeEntity, hbtheme => hbtheme.pack, {onDelete: "CASCADE"})
    hbthemes: HBThemeEntity[];

    @Column()
    @SelectAlways()
    isPrivate: boolean;

    @AfterLoad()
    setUrls() {
        this.downloadUrl = CDNMapper.packs.download(this.id);
        this.pageUrl = WebsiteMappings.pack(this.id);
    }

}