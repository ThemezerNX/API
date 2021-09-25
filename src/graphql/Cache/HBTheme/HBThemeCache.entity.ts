import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {ItemCacheEntityInterface} from "../ItemCache.entity.interface";
import {HBThemeEntity} from "../../HBTheme/HBTheme.entity";


@Entity("hbtheme_cache")
export class HBThemeCacheEntity extends ItemCacheEntityInterface {

    @ManyToOne(() => HBThemeEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "hbthemeId"})
    hbtheme: HBThemeEntity;

    @PrimaryColumn()
    hbthemeId: string;

    @Column({type: "bytea"})
    file: Buffer;

}