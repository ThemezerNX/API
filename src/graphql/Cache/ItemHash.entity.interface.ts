import {AfterLoad, BaseEntity, ViewColumn} from "typeorm";


export class ItemHashEntityInterface extends BaseEntity {

    @ViewColumn()
    hash: Buffer;

    hashString: string;

    @AfterLoad()
    setUrls() {
        this.hashString = this.hash?.toString("hex");
    }

}