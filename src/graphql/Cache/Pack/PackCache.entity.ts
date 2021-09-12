import {Entity, JoinColumn, ManyToOne} from "typeorm";
import {PackEntity} from "../../Pack/Pack.entity";
import {ItemCacheEntityInterface} from "../ItemCache.entity.interface";

@Entity()
export class PackCacheEntity extends ItemCacheEntityInterface {

    @JoinColumn()
    @ManyToOne(() => PackEntity, {primary: true, onDelete: "CASCADE"})
    theme: PackEntity;

}