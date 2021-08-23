import {BaseEntity, Column, CreateDateColumn} from "typeorm";


export class CachedItem extends BaseEntity {

    @CreateDateColumn()
    timestamp: Date;

    @Column("bytea")
    file: any;

    @Column()
    fileName: string;

}