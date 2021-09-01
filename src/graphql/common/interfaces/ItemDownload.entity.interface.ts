import {BaseEntity, CreateDateColumn, JoinColumn, ManyToOne} from "typeorm";
import {UserEntity} from "../../User/User.entity";
import {DownloadClientEntity} from "../../DownloadClient/DownloadClient.entity";

export abstract class ItemDownloadEntityInterface extends BaseEntity {

    @JoinColumn()
    @ManyToOne(() => UserEntity, {primary: true, onDelete: "CASCADE"})
    user: UserEntity;

    @CreateDateColumn({primary: true, type: "timestamp"})
    timestamp: Date;

    @JoinColumn()
    @ManyToOne(() => DownloadClientEntity, {primary: true})
    downloadClient: DownloadClientEntity;

}