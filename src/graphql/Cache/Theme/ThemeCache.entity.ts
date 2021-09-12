import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {ItemCacheEntityInterface} from "../ItemCache.entity.interface";
import {ThemeEntity} from "../../Theme/Theme.entity";


@Entity()
export class ThemeCacheEntity extends ItemCacheEntityInterface {

    @ManyToOne(() => ThemeEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "themeId"})
    theme: ThemeEntity;

    @PrimaryColumn()
    themeId: string;

    @Column()
    file: any;

}