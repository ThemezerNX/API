import {BaseEntity, VersionColumn} from "typeorm";

export class CachableEntityInterface extends BaseEntity {

    @VersionColumn()
    cacheID: number;

}