import {Entity, OneToMany, OneToOne} from "typeorm";
import {ItemEntityInterface} from "../common/interfaces/Item.entity.interface";
import {PackPreviewsEntity} from "./Previews/PackPreviews.entity";
import {ThemeEntity} from "../Theme/Theme.entity";
import {HBThemeEntity} from "../HBTheme/HBTheme.entity";
import {CDNMapper} from "../common/CDNMapper";

@Entity()
export class PackEntity extends ItemEntityInterface {

    get isNSFW() {
        return undefined;
    }

    @OneToOne(() => PackPreviewsEntity, packPreviews => packPreviews.pack, {cascade: true, eager: true})
    previews: PackPreviewsEntity;

    @OneToMany(() => ThemeEntity, theme => theme.pack, {onDelete: "CASCADE"})
    themes: ThemeEntity[];

    @OneToMany(() => HBThemeEntity, hbtheme => hbtheme.pack, {onDelete: "CASCADE"})
    hbthemes: HBThemeEntity[];

    get entries() {
        return [...(this.themes || []), ...(this.hbthemes || [])];
    }

    get downloadUrl(): string {
        return CDNMapper.packs.download(this.id);
    }

}