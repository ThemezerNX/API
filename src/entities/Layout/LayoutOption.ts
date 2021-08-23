import {BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {Layout} from "./Layout";
import {LayoutOptionValue} from "./LayoutOptionValue";


@ObjectType()
@Entity()
export class LayoutOption extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Layout, {onDelete: "CASCADE", cascade: true})
    @JoinColumn()
    layout: Layout;

    @Field(() => [LayoutOptionValue])
    @JoinColumn()
    values: LayoutOptionValue[];

}