import {Field, ObjectType} from "@nestjs/graphql";
import {JSONResolver, UUIDResolver} from "graphql-scalars";
import {LayoutOptionValuePreviewsModel} from "../OptionValuePreviews/LayoutOptionValuePreviews.model";
import {LayoutOptionModel} from "../LayoutOption.model";


@ObjectType("LayoutOptionValue")
export class LayoutOptionValueModel {

    @Field(() => LayoutOptionModel)
    layoutOption: LayoutOptionModel;

    @Field(() => UUIDResolver)
    uuid: string;

    @Field(() => JSONResolver)
    json: string;

    @Field(() => LayoutOptionValuePreviewsModel, {nullable: true})
    previews?: LayoutOptionValuePreviewsModel;

}