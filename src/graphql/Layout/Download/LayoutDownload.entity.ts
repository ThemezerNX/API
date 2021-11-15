import {AfterInsert, Entity, getConnection, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {ItemDownloadEntityInterface} from "../../common/interfaces/ItemDownload.entity.interface";
import {LayoutEntity} from "../Layout.entity";

@Entity()
export class LayoutDownloadEntity extends ItemDownloadEntityInterface {

    @ManyToOne(() => LayoutEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "layoutId"})
    layout: LayoutEntity;

    @PrimaryColumn()
    layoutId: string;

    @AfterInsert()
    async addCount() {
        await getConnection()
            .getRepository(LayoutEntity)
            .increment({id: this.layoutId}, "downloadCount", 1);
    }

}