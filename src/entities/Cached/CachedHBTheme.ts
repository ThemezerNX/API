import {Entity, JoinColumn, ManyToOne} from "typeorm";
import {CachedItem} from "./CachedItem";
import {HBTheme} from "../Theme/HBTheme";


@Entity()
export class CachedHBTheme extends CachedItem {

    @JoinColumn()
    @ManyToOne(() => HBTheme, {primary: true, onDelete: "CASCADE"})
    theme: HBTheme;

}