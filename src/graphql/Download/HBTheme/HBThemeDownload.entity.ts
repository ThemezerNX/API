import {AfterInsert, AfterRemove, Entity, getConnection, JoinColumn, ManyToOne} from "typeorm";
import {ItemDownloadEntityInterface} from "../../common/interfaces/ItemDownload.entity.interface";
import {HBThemeEntity} from "../../HBTheme/HBTheme.entity";

@Entity()
export class HBThemeDownloadEntity extends ItemDownloadEntityInterface {

    @JoinColumn()
    @ManyToOne(() => HBThemeEntity, {primary: true, onDelete: "CASCADE"})
    hbtheme: HBThemeEntity;

    @AfterInsert()
    async addCount() {
        this.hbtheme.dlCount++;
        await getConnection().getRepository(HBThemeEntity).save(this.hbtheme);
    }

    @AfterRemove()
    async removeCount() {
        this.hbtheme.dlCount--;
        await getConnection().getRepository(HBThemeEntity).save(this.hbtheme);
    }

}