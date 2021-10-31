import {Field, ObjectType} from "@nestjs/graphql";
import {ItemModelInterface} from "../common/interfaces/Item.model.interface";
import {HBThemeModel} from "../HBTheme/HBTheme.model";
import {ThemeModel} from "../Theme/Theme.model";
import {PackPreviewsModel} from "./Previews/PackPreviews.model";


@ObjectType("Pack", {implements: [ItemModelInterface]})
export class PackModel extends ItemModelInterface {

    @Field()
    isNSFW: boolean;

    @Field(() => PackPreviewsModel)
    previews: PackPreviewsModel;

    @Field(() => [ThemeModel])
    themes: ThemeModel[];

    @Field(() => [HBThemeModel])
    hbthemes: HBThemeModel[];

    // Wait for https://github.com/wesleyyoung/perch-query-builder/issues/15 to be fixed
    // @Field(() => [PackEntriesUnion])
    // entries: Array<typeof PackEntriesUnion>;

}