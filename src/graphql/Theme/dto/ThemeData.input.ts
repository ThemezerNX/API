import {Field, InputType} from "@nestjs/graphql";
import {IsHexadecimal, IsOptional} from "class-validator";
import {Target} from "../../common/enums/Target";
import {ThemeAssetsDataInput} from "./ThemeAssetsData.input";
import {ValidateChild} from "../../common/decorators/ValidateNested.decorator";
import {ChosenLayoutOptionValue} from "../../Layout/dto/ChosenLayoutOptionValue.input";
import {ThemeItemDataInputInterface} from "../../common/interfaces/ThemeItemData.input.interface";

@InputType()
export class ThemeDataInput extends ThemeItemDataInputInterface {

    @Field(() => Target)
    target: Target;

    @Field({
        nullable: true,
        description: "If there is no layout id, the default layout (the stock Nintendo one) for the target will be selected. A completely custom json can be provided in the assets.",
    })
    @IsHexadecimal()
    @IsOptional()
    layoutId?: string;

    @Field(() => [ChosenLayoutOptionValue], {nullable: true})
    @ValidateChild(() => ChosenLayoutOptionValue)
    options: ChosenLayoutOptionValue[] = [];

    @Field(() => ThemeAssetsDataInput, {nullable: true})
    @ValidateChild(() => ThemeAssetsDataInput)
    @IsOptional()
    assets?: ThemeAssetsDataInput;

}