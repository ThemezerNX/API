import {Column, Entity, JoinColumn} from "typeorm";
import {ItemEntityInterface} from "../common/interfaces/Item.entity.interface";

@Entity()
export class PackEntity extends ItemEntityInterface {

    @Column()
    isNSFW: boolean;

}