import {Field, ObjectType} from "@nestjs/graphql";
import {URLResolver} from "graphql-scalars";

@ObjectType()
export class HBThemeAssetsModel {

    // @Field(() => URLResolver, {nullable: true})
    // get batteryIcon(): string {
    //     return this.batteryIconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/batteryIcon` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get chargingIcon(): string {
    //     return this.chargingIconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/chargingIcon` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get folderIcon(): string {
    //     return this.folderIconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/folderIcon` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get invalidIcon(): string {
    //     return this.invalidIconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/invalidIcon` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get themeIconDark(): string {
    //     return this.themeIconDarkFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/themeIconDark` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get themeIconLight(): string {
    //     return this.themeIconLightFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/themeIconLight` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get airplaneIcon(): string {
    //     return this.airplaneIconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/airplaneIcon` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get wifiNoneIcon(): string {
    //     return this.wifiNoneIconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/wifiNoneIcon` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get wifi1Icon(): string {
    //     return this.wifi1IconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/wifi1Icon` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get wifi2Icon(): string {
    //     return this.wifi2IconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/wifi2Icon` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get wifi3Icon(): string {
    //     return this.wifi3IconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/wifi3Icon` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get ethIcon(): string {
    //     return this.ethIconFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/ethIcon` : null;
    // }
    //
    // @Field(() => URLResolver, {nullable: true})
    // get backgroundImage(): string {
    //     return this.backgroundImageFile ? `//cdn.themezer.net/themes/${this.hbThemeId}/${this.randomUuid}/assets/backgroundImage` : null;
    // }

}