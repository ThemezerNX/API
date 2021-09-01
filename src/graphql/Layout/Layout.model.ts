import {Field, ObjectType} from "@nestjs/graphql";
import {HexColorCodeResolver, JSONResolver, UUIDResolver} from "graphql-scalars";
import {Target} from "../common/enums/Target";
import {ItemModelInterface} from "../common/interfaces/Item.model.interface";
import {UserModel} from "../User/User.model";
import {LayoutOptionModel} from "./LayoutOption/LayoutOption.model";
import {LayoutPreviewsModel} from "./LayoutPreviews/LayoutPreviews.model";


@ObjectType("Layout", {implements: [ItemModelInterface]})
export class LayoutModel extends ItemModelInterface {

    @Field(() => UUIDResolver)
    uuid: string;

    @Field()
    creator: UserModel;

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


}