import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Generated,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";
import {UserEntity} from "../../User/User.entity";


export abstract class ItemEntityInterface extends BaseEntity {

    @Column({type: "int", update: false})
    @Generated("increment")
    readonly counter: number;

    @PrimaryColumn("varchar", {default: () => "to_hex(lastval())", update: false})
    id: string;

    @JoinColumn({name: "creatorId"})
    @ManyToOne(() => UserEntity, {onDelete: "CASCADE"})
    creator: UserEntity;

    @Column("char", {length: 19})
    creatorId: string;

    @Column({length: 100})
    name: string;

    @Column({nullable: true, length: 1000})
    description?: string;

    @CreateDateColumn({type: "timestamp", update: false})
    addedTimestamp: Date;

    @UpdateDateColumn({type: "timestamp"})
    updatedTimestamp: Date;

    @Column("int", {default: 0})
    dlCount: number;

}