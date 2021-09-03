import {Entity, OneToMany, OneToOne} from "typeorm";
import {ItemEntityInterface} from "../common/interfaces/Item.entity.interface";
import {PackPreviewsEntity} from "./PackPreviews/PackPreviews.entity";
import {ThemeEntity} from "../Theme/Theme.entity";
import {HBThemeEntity} from "../HBTheme/HBTheme.entity";

@Entity()
export class PackEntity extends ItemEntityInterface {

    get isNSFW() {
        return undefined;
    }

    @OneToOne(() => PackPreviewsEntity, packPreviews => packPreviews.pack, {cascade: true, eager: true})
    previews: PackPreviewsEntity;

    @OneToMany(() => ThemeEntity, theme => theme.pack, {onDelete: "CASCADE"})
    themes: ThemeEntity[];

    @OneToMany(() => HBThemeEntity, hbTheme => hbTheme.pack, {onDelete: "CASCADE"})
    hbThemes: HBThemeEntity[];

    get entries() {
        return [...(this.themes || []), ...(this.hbThemes || [])];
    }

}