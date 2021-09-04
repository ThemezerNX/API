import {createUnionType, Field, ObjectType} from "@nestjs/graphql";
import {ItemModelInterface} from "../common/interfaces/Item.model.interface";
import {HBThemeModel} from "../HBTheme/HBTheme.model";
import {ThemeModel} from "../Theme/Theme.model";
import {PackPreviewsModel} from "./Previews/PackPreviews.model";
import {HBThemeEntity} from "../HBTheme/HBTheme.entity";
import {ThemeEntity} from "../Theme/Theme.entity";


export const PackEntriesUnion = createUnionType({
    name: "PackEntries",
    types: () => [ThemeModel, HBThemeModel],
    resolveType(value) {
        if (value instanceof ThemeEntity) return ThemeModel;
        if (value instanceof HBThemeEntity) return HBThemeModel;
    },
});

@ObjectType("Pack", {implements: [ItemModelInterface]})
export class PackModel extends ItemModelInterface {

    @Field()
    isNSFW: boolean;

    @Field(() => PackPreviewsModel)
    previews: PackPreviewsModel;

    @Field(() => [PackEntriesUnion])
    entries: Array<typeof PackEntriesUnion>;

}