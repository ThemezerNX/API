import {Entity, JoinColumn, ManyToOne} from "typeorm";
import {ItemCacheEntityInterface} from "../ItemCache.entity.interface";
import {LayoutEntity} from "../../Layout/Layout.entity";

@Entity()
export class LayoutCacheEntity extends ItemCacheEntityInterface {

    @JoinColumn()
    @ManyToOne(() => LayoutEntity, {primary: true, onDelete: "CASCADE"})
    theme: LayoutEntity;

}