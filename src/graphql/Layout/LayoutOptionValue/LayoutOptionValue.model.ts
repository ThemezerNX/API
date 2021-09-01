import {Field, ObjectType} from "@nestjs/graphql";
import {JSONResolver, UUIDResolver} from "graphql-scalars";
import {LayoutOptionValuePreviewsModel} from "../LayoutOptionValuePreviews/LayoutOptionValuePreviews.model";


@ObjectType("LayoutOptionValue")
export class LayoutOptionValueModel {

    @Field(() => UUIDResolver)
    uuid: string;

    @Field(() => JSONResolver)
    json: string;

    @Field(() => LayoutOptionValuePreviewsModel)
    previews: LayoutOptionValuePreviewsModel;

}