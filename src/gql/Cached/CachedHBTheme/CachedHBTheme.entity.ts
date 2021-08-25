import {Entity, JoinColumn, ManyToOne} from "typeorm";
import {CachedItemEntityInterface} from "../CachedItem.entity.interface";
import {HBThemeEntity} from "../../HBTheme/HBTheme.entity";


@Entity()
export class CachedHBThemeEntity extends CachedItemEntityInterface {

    @ManyToOne(() => HBThemeEntity, {primary: true, onDelete: "CASCADE"})
    @JoinColumn()
    theme: HBThemeEntity;

}