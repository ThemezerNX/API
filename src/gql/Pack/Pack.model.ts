import {createUnionType, Field, ObjectType} from "@nestjs/graphql";
import {ItemModelInterface} from "../common/interfaces/Item.model.interface";
import {HBThemeModel} from "../HBTheme/HBTheme.model";
import {ThemeModel} from "../Theme/Theme.model";

export const PackEntriesUnion = createUnionType({
    name: "PackEntries",
    types: () => [ThemeModel, HBThemeModel],
});

@ObjectType({implements: () => [ItemModelInterface]})
export class PackModel extends ItemModelInterface {

    @Field()
    isNSFW: boolean;

    @Field(() => [PackEntriesUnion])
    themes: typeof PackEntriesUnion[];

}