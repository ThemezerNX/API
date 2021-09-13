import {BaseEntity, Column, CreateDateColumn} from "typeorm";


export class ItemCacheEntityInterface extends BaseEntity {

    @CreateDateColumn()
    timestamp: Date;

    @Column("bytea")
    file: Buffer;

    @Column()
    fileName: string;

}