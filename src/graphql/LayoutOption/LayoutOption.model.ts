import {Field, ObjectType} from "@nestjs/graphql";
import {LayoutOptionValueModel} from "./OptionValue/LayoutOptionValue.model";
import {LayoutOptionType} from "./common/LayoutOptionType.enum";
import {RootModelAbstract} from "../common/interfaces/Root.model.abstract";


@ObjectType("LayoutOption")
export class LayoutOptionModel extends RootModelAbstract {

    @Field()
    name: string;

    @Field(() => LayoutOptionType)
    type: LayoutOptionType;

    @Field(() => [LayoutOptionValueModel])
    values: LayoutOptionValueModel[];

}