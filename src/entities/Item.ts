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
import {Field, ID} from "type-graphql";
import {User} from "./User/User";


export class Item extends BaseEntity {

    @Column("int", {select: false})
    @Generated("increment")
    counter: number;

    @Field(() => ID)
    @PrimaryColumn("varchar", {
        generatedType: "STORED",
        update: false,
        asExpression: "to_hex(counter)",
    })
    id: string;

    @Field()
    @JoinColumn()
    @ManyToOne(() => User, {onDelete: "CASCADE"})
    creator: User;

    @Field()
    @Column({length: 100})
    name: string;

    @Field()
    @Column({nullable: true, length: 1000})
    description?: string;

    @Field()
    @CreateDateColumn({type: "timestamp"})
    addedTimestamp: Date;

    @Field()
    @UpdateDateColumn({type: "timestamp"})
    updatedTimestamp: Date;

    @Field()
    @Column("int", {default: 0})
    dlCount: number;

}