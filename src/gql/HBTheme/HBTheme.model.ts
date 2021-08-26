import {Field, ObjectType} from "@nestjs/graphql";
import {ItemModelInterface} from "../common/interfaces/Item.model.interface";
import {ThemeTagModel} from "../ThemeTag/ThemeTag.model";
import {PackModel} from "../Pack/Pack.model";
import {HBThemePreviewsModel} from "./HBThemePreviews/HBThemePreviews.model";
import {HBThemeAssetsModel} from "./HBThemeAssets/HBThemeAssets.model";
import {UserModel} from "../User/User.model";


@ObjectType({implements: () => [ItemModelInterface]})
export class HBThemeModel extends ItemModelInterface {

    id: string;

    creator: UserModel;

    name: string;

    description?: string;

    addedTimestamp: Date;

    updatedTimestamp: Date;

    dlCount: number;

    @Field(() => PackModel)
    pack: PackModel;

    @Field()
    isNSFW: boolean;

    @Field(() => [ThemeTagModel])
    tags: ThemeTagModel[];

    @Field(() => HBThemePreviewsModel)
    previews: HBThemePreviewsModel;

    @Field(() => HBThemeAssetsModel)
    assets: HBThemeAssetsModel;

}