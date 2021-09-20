import {Field, ObjectType} from "@nestjs/graphql";
import {Target} from "../common/enums/Target";
import {ItemModelInterface} from "../common/interfaces/Item.model.interface";
import {PackModel} from "../Pack/Pack.model";
import {LayoutModel} from "../Layout/Layout.model";
import {ThemeAssetsModel} from "./Assets/ThemeAssets.model";
import {ThemePreviewsModel} from "./Previews/ThemePreviews.model";
import {ThemeTagModel} from "../ThemeTag/ThemeTag.model";
import {ThemeOptionModel} from "./ThemeOptions/ThemeOption.model";


@ObjectType("Theme", {implements: [ItemModelInterface]})
export class ThemeModel extends ItemModelInterface {

    @Field(() => PackModel, {nullable: true})
    pack?: PackModel;

    @Field(() => Target)
    target: Target;

    @Field()
    isNSFW: boolean;

    @Field({nullable: true})
    layout?: LayoutModel;

    @Field(() => [ThemeTagModel])
    tags: ThemeTagModel[];

    @Field(() => ThemePreviewsModel)
    previews: ThemePreviewsModel;

    @Field(() => [ThemeOptionModel])
    options: ThemeOptionModel[];

    @Field(() => ThemeAssetsModel)
    assets: ThemeAssetsModel;

}