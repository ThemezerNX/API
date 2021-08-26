import {BaseEntity, BeforeUpdate, Generated} from "typeorm";
import {v4 as uuid} from "uuid";

export class CachableEntityInterface extends BaseEntity {

    @Generated("uuid")
    cacheUUID: string;

    @BeforeUpdate()
    randomizeUuid() {
        this.cacheUUID = uuid();
    }

}