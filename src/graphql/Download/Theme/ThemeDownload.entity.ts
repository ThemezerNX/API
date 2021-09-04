import {AfterInsert, AfterRemove, Entity, getConnection, JoinColumn, ManyToOne} from "typeorm";
import {ItemDownloadEntityInterface} from "../../common/interfaces/ItemDownload.entity.interface";
import {ThemeEntity} from "../../Theme/Theme.entity";

@Entity()
export class ThemeDownloadEntity extends ItemDownloadEntityInterface {

    @JoinColumn()
    @ManyToOne(() => ThemeEntity, {primary: true, onDelete: "CASCADE"})
    theme: ThemeEntity;

    @AfterInsert()
    async addCount() {
        this.theme.dlCount++;
        await getConnection().getRepository(ThemeEntity).save(this.theme);
    }

    @AfterRemove()
    async removeCount() {
        this.theme.dlCount--;
        await getConnection().getRepository(ThemeEntity).save(this.theme);
    }

}