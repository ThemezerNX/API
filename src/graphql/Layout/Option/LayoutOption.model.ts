import {Field, ObjectType} from "@nestjs/graphql";
import {LayoutOptionValueModel} from "../OptionValue/LayoutOptionValue.model";


@ObjectType("LayoutOption")
export class LayoutOptionModel {

    @Field(() => [LayoutOptionValueModel])
    values: LayoutOptionValueModel[];

}