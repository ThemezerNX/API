import {Field, ObjectType} from "@nestjs/graphql";
import {ItemModelInterface} from "../common/interfaces/Item.model.interface";
import {ThemeTagModel} from "../ThemeTag/ThemeTag.model";
import {PackModel} from "../Pack/Pack.model";
import {HBThemePreviewsModel} from "./HBThemePreviews/HBThemePreviews.model";
import {HBThemeAssetsModel} from "./HBThemeAssets/HBThemeAssets.model";
import {Target} from "../common/enums/Target";


@ObjectType("HBTheme", {implements: () => [ItemModelInterface]})
export class HBThemeModel extends ItemModelInterface {

    @Field(() => PackModel, {nullable: true})
    pack?: PackModel;

    @Field(() => Target)
    readonly target: Target = Target.HBMENU;

    @Field()
    isNSFW: boolean;

    @Field(() => [ThemeTagModel])
    tags: ThemeTagModel[];

    @Field(() => HBThemePreviewsModel)
    previews: HBThemePreviewsModel;

    @Field(() => HBThemeAssetsModel)
    assets: HBThemeAssetsModel;

}