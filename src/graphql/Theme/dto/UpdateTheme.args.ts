import {ArgsType, Field} from "@nestjs/graphql";
import {ValidateChild} from "../../common/decorators/ValidateNested.decorator";
import {UpdateThemeDataInput} from "./UpdateThemeData.input";
import {IsHexadecimal} from "class-validator";

@ArgsType()
export class UpdateThemeArgs {

    @Field()
    @IsHexadecimal()
    id: string;

    @Field(() => UpdateThemeDataInput)
    @ValidateChild(() => UpdateThemeDataInput)
    data: UpdateThemeDataInput;

}
