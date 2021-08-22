import {BaseEntity, Entity, JoinColumn, ManyToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {Layout} from "./Layout";
import {LayoutOptionValue} from "./LayoutOptionValue";


@ObjectType()
@Entity()
export class LayoutOption extends BaseEntity {

    @ManyToOne(() => Layout, {primary: true, onDelete: "CASCADE", cascade: true})
    @JoinColumn()
    layout: Layout;

    @Field(() => [LayoutOptionValue])
    @JoinColumn()
    values: LayoutOptionValue[];

}