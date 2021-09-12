import {AfterInsert, Entity, getConnection, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {ItemDownloadEntityInterface} from "../../common/interfaces/ItemDownload.entity.interface";
import {HBThemeEntity} from "../HBTheme.entity";

@Entity()
export class HBThemeDownloadEntity extends ItemDownloadEntityInterface {

    @ManyToOne(() => HBThemeEntity, {onDelete: "CASCADE"})
    @JoinColumn({name: "hbthemeId"})
    hbtheme: HBThemeEntity;

    @PrimaryColumn()
    hbthemeId: string;

    @AfterInsert()
    async addCount() {
        await getConnection()
            .getRepository(HBThemeEntity)
            .increment({id: this.hbthemeId}, "dlCount", 1);
    }

}