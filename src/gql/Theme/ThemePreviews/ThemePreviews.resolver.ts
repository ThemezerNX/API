import {Parent, ResolveField, Resolver} from "@nestjs/graphql";
import {ThemePreviewsModel} from "./ThemePreviews.model";


@Resolver(ThemePreviewsModel)
export class ThemePreviewsResolver {

    // constructor(themePreviewsService: ThemePreviewsService) {
    // }
    //
    // @ResolveField()
    // image720(@Parent() themePreviews: ThemePreviewsModel): string {
    //     return `//cdn.themezer.net/themes/${themePreviews.themeId}/${themePreviews.randomUuid}/previews/720`;
    // }
    //
    // @ResolveField()
    // image360(@Parent() themePreviews: ThemePreviewsModel): string {
    //     return `//cdn.themezer.net/themes/${themePreviews.themeId}/${themePreviews.randomUuid}/previews/360`;
    // }
    //
    // @ResolveField()
    // image240(@Parent() themePreviews: ThemePreviewsModel): string {
    //     return `//cdn.themezer.net/themes/${themePreviews.themeId}/${themePreviews.randomUuid}/previews/240`;
    // }
    //
    // @ResolveField()
    // image180(@Parent() themePreviews: ThemePreviewsModel): string {
    //     return `//cdn.themezer.net/themes/${themePreviews.themeId}/${themePreviews.randomUuid}/previews/180`;
    // }
    //
    // @ResolveField()
    // imagePlaceholder(@Parent() themePreviews: ThemePreviewsModel): string {
    //     return `//cdn.themezer.net/themes/${themePreviews.themeId}/${themePreviews.randomUuid}/previews/placeholder`;
    // }

}