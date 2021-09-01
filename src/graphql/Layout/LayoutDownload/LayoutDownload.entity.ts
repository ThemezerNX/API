import {AfterInsert, AfterRemove, Entity, getConnection, JoinColumn, ManyToOne} from "typeorm";
import {ItemDownloadEntityInterface} from "../../common/interfaces/ItemDownload.entity.interface";
import {LayoutEntity} from "../Layout.entity";

@Entity()
export class LayoutDownloadEntity extends ItemDownloadEntityInterface {

    @JoinColumn()
    @ManyToOne(() => LayoutEntity, {primary: true, onDelete: "CASCADE"})
    layout: LayoutEntity;

    @AfterInsert()
    async addCount() {
        this.layout.dlCount++;
        await getConnection().getRepository(LayoutEntity).save(this.layout);
    }

    @AfterRemove()
    async removeCount() {
        this.layout.dlCount--;
        await getConnection().getRepository(LayoutEntity).save(this.layout);
    }

}