import {Field, ObjectType} from "@nestjs/graphql";
import {LayoutOptionValueModel} from "./OptionValue/LayoutOptionValue.model";
import {LayoutOptionType} from "./common/LayoutOptionType.enum";


@ObjectType("LayoutOption")
export class LayoutOptionModel {

    @Field()
    name: string;

    @Field(() => LayoutOptionType)
    type: LayoutOptionType;

    @Field(() => [LayoutOptionValueModel])
    values: LayoutOptionValueModel[];

}