import {Field, ObjectType} from "@nestjs/graphql";
import {JSONResolver, URLResolver} from "graphql-scalars";

@ObjectType()
export class ThemeAssetsModel {

    @Field(() => JSONResolver, {nullable: true})
    customLayoutJson?: JSON;

    @Field(() => JSONResolver, {nullable: true})
    customCommonLayoutJson?: JSON;

    // @Field(() => URLResolver, {nullable: true})
    // get image(): string {
    //     return this.imageFile ? `//cdn.themezer.net/themes/${this.themeId}/${this.randomUuid}/assets/image` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get albumIcon(): string {
    //     return this.albumIconFile ? `//cdn.themezer.net/themes/${this.themeId}/${this.randomUuid}/assets/albumIcon` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get newsIcon(): string {
    //     return this.newsIconFile ? `//cdn.themezer.net/themes/${this.themeId}/${this.randomUuid}/assets/newsIcon` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get shopIcon(): string {
    //     return this.shopIconFile ? `//cdn.themezer.net/themes/${this.themeId}/${this.randomUuid}/assets/shopIcon` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get controllerIcon(): string {
    //     return this.controllerIconFile ? `//cdn.themezer.net/themes/${this.themeId}/${this.randomUuid}/assets/controllerIcon` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get settingsIcon(): string {
    //     return this.settingsIconFile ? `//cdn.themezer.net/themes/${this.themeId}/${this.randomUuid}/assets/settingsIcon` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get powerIcon(): string {
    //     return this.powerIconFile ? `//cdn.themezer.net/themes/${this.themeId}/${this.randomUuid}/assets/powerIcon` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get homeIcon(): string {
    //     return this.homeIconFile ? `//cdn.themezer.net/themes/${this.themeId}/${this.randomUuid}/assets/homeIcon` : null;
    // }

}