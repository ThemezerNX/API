import {Column, CreateDateColumn, Generated, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {UserEntity} from "../../User/User.entity";
import {CachableEntityInterface} from "./Cachable.entity.interface";


export abstract class ItemEntityInterface extends CachableEntityInterface {

    @Column({type: "int", update: false, select: false})
    @Generated("increment")
    readonly counter: number;

    @PrimaryColumn("varchar", {default: () => "to_hex(lastval())", update: false})
    id: string;

    @JoinColumn({name: "creatorId"})
    @ManyToOne(() => UserEntity, {onDelete: "CASCADE"})
    creator: UserEntity;

    @Column("varchar", {length: 19})
    creatorId: string;

    @Column({length: 100})
    name: string;

    @Column({nullable: true, length: 1000})
    description?: string;

    @CreateDateColumn({type: "timestamp", update: false})
    addedTimestamp: Date;

    // TODO: is this updated when downloadCount is incremented
    @UpdateDateColumn({type: "timestamp"})
    updatedTimestamp: Date;

    @Column("int", {default: 0})
    downloadCount: number;

}