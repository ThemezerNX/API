import {AfterInsert, AfterRemove, Entity, getConnection, JoinColumn, ManyToOne} from "typeorm";
import {HBThemeEntity} from "../HBTheme.entity";
import {ItemDownloadEntityInterface} from "../../common/interfaces/ItemDownload.entity.interface";

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