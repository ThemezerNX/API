import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";


@Entity()
export class DownloadClient extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userAgent: string;

}