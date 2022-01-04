import {Field, InputType} from "@nestjs/graphql";
import {IsOptional} from "class-validator";
import {ChosenLayoutOptionValue} from "../../Layout/dto/ChosenLayoutOptionValue.input";
import {ValidateChild} from "../../common/decorators/ValidateNested.decorator";
import {ThemeAssetsDataInput} from "./ThemeAssetsData.input";
import {UpdateThemeItemDataInputInterface} from "../../common/interfaces/UpdateThemeItemData.input.interface";

@InputType({description: "Acts as a patch. Undefined fields are not updated, null fields are set to null."})
export class UpdateThemeDataInput extends UpdateThemeItemDataInputInterface {

    @Field(() => [ChosenLayoutOptionValue], {nullable: true})
    @ValidateChild(() => ChosenLayoutOptionValue)
    @IsOptional()
    options?: ChosenLayoutOptionValue[];

    @Field(() => ThemeAssetsDataInput)
    @ValidateChild(() => ThemeAssetsDataInput)
    @IsOptional()
    assets?: ThemeAssetsDataInput;

    // Do not support this for now. Use the dedicated updateVisibility mutation for this
    // makePrivate: boolean;

}