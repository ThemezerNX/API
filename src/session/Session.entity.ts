import {ISession} from "connect-typeorm";
import {BaseEntity, Column, Entity, Index, PrimaryColumn} from "typeorm";


@Entity()
export class SessionEntity extends BaseEntity implements ISession {

    @PrimaryColumn("varchar", {length: 255})
    public id = "";

    @Index()
    @Column("bigint")
    public expiredAt = Date.now();

    @Column("text")
    public json = "";

}
