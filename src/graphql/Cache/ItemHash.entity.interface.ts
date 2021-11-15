import {BaseEntity, Column, CreateDateColumn, ViewColumn} from "typeorm";


export class ItemHashEntityInterface extends BaseEntity {

    @ViewColumn()
    hash: Buffer;

    get hashString() {
        return this.hash?.toString("hex");
    }

}