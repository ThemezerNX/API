import {Field, ObjectType} from "@nestjs/graphql";
import {LayoutOptionValueModel} from "../LayoutOptionValue/LayoutOptionValue.model";


@ObjectType("LayoutOption")
export class LayoutOptionModel {

    @Field(() => [LayoutOptionValueModel])
    values: LayoutOptionValueModel[];

}