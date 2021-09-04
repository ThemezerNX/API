import {AfterInsert, AfterRemove, Entity, getConnection, JoinColumn, ManyToOne} from "typeorm";
import {ItemDownloadEntityInterface} from "../../common/interfaces/ItemDownload.entity.interface";
import {PackEntity} from "../../Pack/Pack.entity";

@Entity()
export class PackDownloadEntity extends ItemDownloadEntityInterface {

    @JoinColumn()
    @ManyToOne(() => {
        return PackEntity;
    }, {primary: true, onDelete: "CASCADE"})
    pack: PackEntity;

    @AfterInsert()
    async addCount() {
        this.pack.dlCount++;
        await getConnection().getRepository(PackEntity).save(this.pack);
    }

    @AfterRemove()
    async removeCount() {
        this.pack.dlCount--;
        await getConnection().getRepository(PackEntity).save(this.pack);
    }

}