import {Entity, JoinColumn, ManyToOne} from "typeorm";
import {CachedItemEntityInterface} from "../CachedItem.entity.interface";
import {LayoutEntity} from "../../Layout/Layout.entity";

@Entity()
export class CachedLayoutEntity extends CachedItemEntityInterface {

    @JoinColumn()
    @ManyToOne(() => LayoutEntity, {primary: true, onDelete: "CASCADE"})
    theme: LayoutEntity;

}