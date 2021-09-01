import {BaseEntity, VersionColumn} from "typeorm";

export abstract class CachableEntityInterface extends BaseEntity {

    @VersionColumn()
    cacheID: number;

}