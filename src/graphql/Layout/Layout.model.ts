import {Field, ObjectType} from "@nestjs/graphql";
import {HexColorCodeResolver, JSONResolver, URLResolver} from "graphql-scalars";
import {Target} from "../common/enums/Target";
import {ItemModelInterface} from "../common/interfaces/Item.model.interface";
import {LayoutOptionModel} from "../LayoutOption/LayoutOption.model";
import {LayoutPreviewsModel} from "./Previews/LayoutPreviews.model";


@ObjectType("Layout", {implements: [ItemModelInterface]})
export class LayoutModel extends ItemModelInterface {

    @Field(() => Target)
    target: Target;

    @Field(() => HexColorCodeResolver, {nullable: true})
    color?: string;

    @Field(() => JSONResolver, {nullable: true})
    json?: string;

    @Field(() => JSONResolver, {nullable: true})
    commonJson?: string;

    @Field(() => [LayoutOptionModel])
    options: LayoutOptionModel[];

    @Field(() => LayoutPreviewsModel)
    previews: LayoutPreviewsModel;

    @Field(() => URLResolver)
    downloadCommonUrl: string;

}