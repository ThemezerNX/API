import {Column, Entity} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {Item} from "../Item";


@ObjectType()
@Entity()
export class Pack extends Item {

    @Field()
    @Column()
    isNSFW: boolean;

}