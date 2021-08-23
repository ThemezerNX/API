import {Entity, JoinColumn, ManyToOne} from "typeorm";
import {Theme} from "../Theme/Theme";
import {CachedItem} from "./CachedItem";


@Entity()
export class CachedTheme extends CachedItem {

    @JoinColumn()
    @ManyToOne(() => Theme, {primary: true, onDelete: "CASCADE"})
    theme: Theme;

}