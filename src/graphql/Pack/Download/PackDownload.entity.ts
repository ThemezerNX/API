import {AfterInsert, Entity, getConnection, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {ItemDownloadEntityInterface} from "../../common/interfaces/ItemDownload.entity.interface";
import {PackEntity} from "../Pack.entity";

@Entity()
export class PackDownloadEntity extends ItemDownloadEntityInterface {

    @ManyToOne(() => PackEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "packId"})
    pack: PackEntity;

    @PrimaryColumn()
    packId: string;

    @AfterInsert()
    async addCount() {
        await getConnection()
            .getRepository(PackEntity)
            .update({id: this.packId}, {
                downloadCount: () => "\"downloadCount\" + 1",
                updatedTimestamp: () => "\"updatedTimestamp\"",
            });
    }

}