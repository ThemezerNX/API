import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {Target} from "../Target";
import {JSONResolver, UUIDResolver} from "graphql-scalars";
import {LayoutOption} from "./LayoutOption";
import {LayoutOptionValuePreviews} from "./LayoutOptionValuePreviews";


@ObjectType()
@Entity()
export class LayoutOptionValue extends BaseEntity {

    @ManyToOne(() => LayoutOption, {onDelete: "CASCADE", cascade: true})
    @JoinColumn()
    layoutOption: LayoutOption;

    @Field(() => UUIDResolver)
    @PrimaryColumn("uuid")
    uuid: string;

    @Field(() => Target)
    @Column({
        type: "enum",
        enum: Target,
    })
    target: Target;

    @Field(() => JSONResolver)
    @Column("jsonb")
    json: string;

    @Field(() => LayoutOptionValuePreviews)
    @JoinColumn()
    previews: LayoutOptionValuePreviews;

}