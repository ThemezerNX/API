import {Field, InputType} from "@nestjs/graphql";
import {IsOptional} from "class-validator";
import {ValidateChild} from "../../common/decorators/ValidateNested.decorator";
import {UpdateThemeItemDataInputInterface} from "../../common/interfaces/UpdateThemeItemData.input.interface";
import {HBThemeAssetsDataInput} from "../../Theme/dto/HBThemeAssetsData.input";

@InputType({description: "Acts as a patch. Undefined fields are not updated, null fields are set to null."})
export class UpdateHBThemeDataInput extends UpdateThemeItemDataInputInterface {

    @Field(() => HBThemeAssetsDataInput, {nullable: true})
    @ValidateChild(() => HBThemeAssetsDataInput)
    @IsOptional()
    assets?: HBThemeAssetsDataInput;

    // Do not support this for now. Use the dedicated updateVisibility mutation for this
    // makePrivate: boolean;

}