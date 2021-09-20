import {Field, ObjectType} from "@nestjs/graphql";
import {LayoutOptionValueModel} from "../../LayoutOption/OptionValue/LayoutOptionValue.model";

@ObjectType("ThemeOptions")
export class ThemeOptionModel {

    @Field(() => LayoutOptionValueModel)
    layoutOptionValue: LayoutOptionValueModel;

    @Field({nullable: true})
    integerValue?: number;

    @Field({nullable: true})
    decimalValue?: number;

    @Field({nullable: true})
    stringValue?: string;

    @Field({nullable: true})
    colorValue?: string;

}