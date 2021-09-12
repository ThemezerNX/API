import {Entity, JoinColumn, ManyToOne} from "typeorm";
import {ItemCacheEntityInterface} from "../ItemCache.entity.interface";
import {HBThemeEntity} from "../../HBTheme/HBTheme.entity";


@Entity()
export class HBThemeCacheEntity extends ItemCacheEntityInterface {

    @ManyToOne(() => HBThemeEntity, {primary: true, onDelete: "CASCADE"})
    @JoinColumn()
    theme: HBThemeEntity;

}