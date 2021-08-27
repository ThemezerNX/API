import {createUnionType, Field, ObjectType} from "@nestjs/graphql";
import {ItemModelInterface} from "../common/interfaces/Item.model.interface";
import {HBThemeModel} from "../HBTheme/HBTheme.model";
import {ThemeModel} from "../Theme/Theme.model";
import {PackPreviewsModel} from "./PackPreviews/PackPreviews.model";
import {Target} from "../common/enums/Target";

export const PackEntriesUnion = createUnionType({
    name: "PackEntries",
    types: () => [ThemeModel, HBThemeModel],
    resolveType(value) {
        if (value.target == Target.HBMENU) {
            return HBThemeModel;
        } else {
            return ThemeModel;
        }
    },
});

@ObjectType("Pack", {implements: () => [ItemModelInterface]})
export class PackModel extends ItemModelInterface {

    @Field()
    isNSFW: boolean;

    @Field(() => PackPreviewsModel)
    previews: PackPreviewsModel;

    @Field(() => [PackEntriesUnion])
    entries: Array<typeof PackEntriesUnion>;

}