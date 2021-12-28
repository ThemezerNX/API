import {ArgsType, Field} from "@nestjs/graphql";
import {ThemeDataInput} from "./ThemeData.input";
import {ArrayMaxSize} from "class-validator";
import {ValidateChild} from "../../common/decorators/ValidateNested.decorator";
import {HBThemeDataInput} from "./HBThemeData.input";

@ArgsType()
export class SubmitThemesArgs {

    @Field(() => [ThemeDataInput], {nullable: true})
    @ArrayMaxSize(25)
    @ValidateChild(() => ThemeDataInput)
    themesData?: ThemeDataInput[] = [];

    @Field(() => [HBThemeDataInput], {nullable: true})
    @ArrayMaxSize(25)
    @ValidateChild(() => HBThemeDataInput)
    hbthemesData?: HBThemeDataInput[] = [];

}
