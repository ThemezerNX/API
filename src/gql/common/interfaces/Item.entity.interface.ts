import {
    AfterInsert,
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

    @Column("int")
    @Generated("increment")
    readonly counter: number;

    @PrimaryColumn("varchar", {
        generatedType: "STORED",
        update: false,
        asExpression: "to_hex(counter)",
    })
    id: string;

    @JoinColumn({name: "creatorId"})
    @ManyToOne(() => UserEntity, {onDelete: "CASCADE"})
    creator: UserEntity;

    @Column()
    creatorId: string;

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

    @AfterInsert()
    generateId() {
        console.log(this)
        this.id = this.counter.toString(16);
        this.save().then();
    }

}