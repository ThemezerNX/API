import {AfterLoad, BaseEntity, Index, ViewColumn} from "typeorm";


export class ItemHashEntityInterface extends BaseEntity {

    @ViewColumn()
    @Index({unique: true})
    id: string;

    @ViewColumn()
    hash: Buffer;

    hashString: string;

    @AfterLoad()
    setUrls() {
        this.hashString = this.hash?.toString("hex");
    }

}