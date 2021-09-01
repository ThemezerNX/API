import {AfterInsert, AfterRemove, Entity, getConnection, JoinColumn, ManyToOne} from "typeorm";
import {HBThemeEntity} from "../HBTheme.entity";
import {ItemDownloadEntityInterface} from "../../common/interfaces/ItemDownload.entity.interface";

@Entity()
export class HBThemeDownloadEntity extends ItemDownloadEntityInterface {

    @JoinColumn()
    @ManyToOne(() => HBThemeEntity, {primary: true, onDelete: "CASCADE"})
    hbTheme: HBThemeEntity;

    @AfterInsert()
    async addCount() {
        this.hbTheme.dlCount++;
        await getConnection().getRepository(HBThemeEntity).save(this.hbTheme);
    }

    @AfterRemove()
    async removeCount() {
        this.hbTheme.dlCount--;
        await getConnection().getRepository(HBThemeEntity).save(this.hbTheme);
    }

}