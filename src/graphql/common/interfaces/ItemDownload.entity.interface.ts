import {BaseEntity, Column, CreateDateColumn, JoinColumn, ManyToOne} from "typeorm";
import {UserEntity} from "../../User/User.entity";
import {DownloadClientEntity} from "../../Download/DownloadClient.entity";

export abstract class ItemDownloadEntityInterface extends BaseEntity {

    @JoinColumn()
    @ManyToOne(() => UserEntity, {primary: true, onDelete: "CASCADE"})
    user: UserEntity;

    @CreateDateColumn({primary: true, type: "timestamp"})
    timestamp: Date;

    @Column()
    ip: string;

    @JoinColumn()
    @ManyToOne(() => DownloadClientEntity, {primary: true})
    downloadClient: DownloadClientEntity;

}