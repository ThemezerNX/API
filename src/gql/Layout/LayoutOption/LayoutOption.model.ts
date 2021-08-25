import {Field, ObjectType} from "@nestjs/graphql";
import {LayoutOptionValueModel} from "../LayoutOptionValue/LayoutOptionValue.model";


@ObjectType()
export class LayoutOptionModel {

    @Field(() => [LayoutOptionValueModel])
    values: LayoutOptionValueModel[];

}