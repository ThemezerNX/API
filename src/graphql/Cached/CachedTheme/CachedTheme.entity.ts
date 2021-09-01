import {Entity, JoinColumn, ManyToOne} from "typeorm";
import {CachedItemEntityInterface} from "../CachedItem.entity.interface";
import {ThemeEntity} from "../../Theme/Theme.entity";


@Entity()
export class CachedThemeEntity extends CachedItemEntityInterface {

    @JoinColumn()
    @ManyToOne(() => ThemeEntity, {primary: true, onDelete: "CASCADE"})
    theme: ThemeEntity;

}