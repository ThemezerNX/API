import {Field, InputType} from "@nestjs/graphql";
import {ValidateChild} from "../../common/decorators/ValidateNested.decorator";
import {HBThemeAssetsDataInput} from "./HBThemeAssetsData.input";
import {ThemeItemDataInputInterface} from "../../common/interfaces/ThemeItemData.input.interface";
import {HBThemeColorSchemeDataInput} from "./HBThemeColorSchemeData.input";

@InputType()
export class HBThemeDataInput extends ThemeItemDataInputInterface {

    @Field(() => HBThemeAssetsDataInput, {nullable: true})
    @ValidateChild(() => HBThemeAssetsDataInput)
    assets: HBThemeAssetsDataInput;

    @Field(() => HBThemeColorSchemeDataInput, {nullable: true})
    @ValidateChild(() => HBThemeColorSchemeDataInput)
    lightTheme: HBThemeColorSchemeDataInput;

    @Field(() => HBThemeColorSchemeDataInput, {nullable: true})
    @ValidateChild(() => HBThemeColorSchemeDataInput)
    darkTheme: HBThemeColorSchemeDataInput;

}