import {BaseEntity, VersionColumn} from "typeorm";

export abstract class CachableEntityInterface extends BaseEntity {

    @VersionColumn({default: 1})
    cacheId: number;

}