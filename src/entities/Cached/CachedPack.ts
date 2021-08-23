import {Entity, JoinColumn, ManyToOne} from "typeorm";
import {CachedItem} from "./CachedItem";
import {Pack} from "../Pack/Pack";


@Entity()
export class CachedPack extends CachedItem {

    @JoinColumn()
    @ManyToOne(() => Pack, {primary: true, onDelete: "CASCADE"})
    theme: Pack;

}