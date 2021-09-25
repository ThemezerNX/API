import {AfterInsert, Entity, getConnection, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {ItemDownloadEntityInterface} from "../../common/interfaces/ItemDownload.entity.interface";
import {ThemeEntity} from "../Theme.entity";

@Entity()
export class ThemeDownloadEntity extends ItemDownloadEntityInterface {

    @ManyToOne(() => ThemeEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "themeId"})
    theme: ThemeEntity;

    @PrimaryColumn()
    themeId: string;

    @AfterInsert()
    async addCount() {
        await getConnection()
            .getRepository(ThemeEntity)
            .increment({id: this.themeId}, "dlCount", 1);
    }

}