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

    @Column("int", {select: false})
    @Generated("increment")
    counter: number;

    @PrimaryColumn("varchar", {
        generatedType: "STORED",
        update: false,
        asExpression: "to_hex(counter)",
    })
    id: string;

    @JoinColumn()
    @ManyToOne(() => UserEntity, {onDelete: "CASCADE"})
    creator: UserEntity;

    @Column({length: 100})
    name: string;

    @Column({nullable: true, length: 1000})
    description?: string;

    @CreateDateColumn({type: "timestamp"})
    addedTimestamp: Date;

    @UpdateDateColumn({type: "timestamp"})
    updatedTimestamp: Date;

    @Column("int", {default: 0})
    dlCount: number;

}