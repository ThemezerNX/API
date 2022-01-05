import {ArgsType, Field} from "@nestjs/graphql";
import {ValidateChild} from "../../common/decorators/ValidateNested.decorator";
import {UpdateHBThemeDataInput} from "./UpdateHBThemeDataInput";
import {IsHexadecimal} from "class-validator";

@ArgsType()
export class UpdateHBThemeArgs {

    @Field()
    @IsHexadecimal()
    id: string;

    @Field(() => UpdateHBThemeDataInput)
    @ValidateChild(() => UpdateHBThemeDataInput)
    data: UpdateHBThemeDataInput;

}
