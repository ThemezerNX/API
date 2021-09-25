import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {PackEntity} from "../../Pack/Pack.entity";
import {ItemCacheEntityInterface} from "../ItemCache.entity.interface";

@Entity()
export class PackCacheEntity extends ItemCacheEntityInterface {

    @ManyToOne(() => PackEntity, {primary: true, onDelete: "CASCADE"})
    @JoinColumn({name: "packId"})
    pack: PackEntity;

    @PrimaryColumn()
    packId: string;

    @Column({type: "bytea"})
    file: Buffer;

}