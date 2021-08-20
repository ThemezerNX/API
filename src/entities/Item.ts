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
    @Column({nullable: false, length: 100})
    name: string;

    @Field()
    @Column({length: 1000})
    description: string;

    @Field()
    @CreateDateColumn({type: "timestamp", nullable: false})
    addedTimestamp: Date;

    @Field()
    @UpdateDateColumn({type: "timestamp", nullable: false})
    updatedTimestamp: Date;

    @Field()
    @Column("int", {nullable: false, default: 0})
    dlCount: number;

}