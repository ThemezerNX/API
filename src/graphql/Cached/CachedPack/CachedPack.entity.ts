import {Entity, JoinColumn, ManyToOne} from "typeorm";
import {PackEntity} from "../../Pack/Pack.entity";
import {CachedItemEntityInterface} from "../CachedItem.entity.interface";

@Entity()
export class CachedPackEntity extends CachedItemEntityInterface {

    @JoinColumn()
    @ManyToOne(() => PackEntity, {primary: true, onDelete: "CASCADE"})
    theme: PackEntity;

}