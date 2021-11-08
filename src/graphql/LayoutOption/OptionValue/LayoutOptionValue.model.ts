import {Field, ObjectType} from "@nestjs/graphql";
import {JSONResolver, UUIDResolver} from "graphql-scalars";
import {LayoutOptionValuePreviewsModel} from "../OptionValuePreviews/LayoutOptionValuePreviews.model";
import {LayoutOptionModel} from "../LayoutOption.model";
import {RootModelAbstract} from "../../common/interfaces/Root.model.abstract";


@ObjectType("LayoutOptionValue")
export class LayoutOptionValueModel extends RootModelAbstract {

    @Field(() => LayoutOptionModel)
    layoutOption: LayoutOptionModel;

    @Field(() => UUIDResolver)
    uuid: string;

    @Field(() => JSONResolver)
    json: string;

    @Field(() => LayoutOptionValuePreviewsModel, {nullable: true})
    previews?: LayoutOptionValuePreviewsModel;

}