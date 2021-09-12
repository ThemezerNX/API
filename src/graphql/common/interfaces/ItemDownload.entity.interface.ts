import {BaseEntity, Column, CreateDateColumn, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {UserEntity} from "../../User/User.entity";
import {DownloadClientEntity} from "../../DownloadClient/DownloadClient.entity";

export abstract class ItemDownloadEntityInterface extends BaseEntity {

    @ManyToOne(() => UserEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "userId"})
    user: UserEntity;

    @Column({nullable: true})
    userId: string;

    @CreateDateColumn({primary: true, type: "timestamp"})
    timestamp: Date;

    @PrimaryColumn()
    ip: string;

    @ManyToOne(() => DownloadClientEntity)
    @JoinColumn({name: "downloadClientId"})
    downloadClient: DownloadClientEntity;

    @Column("int")
    downloadClientId: number;

}