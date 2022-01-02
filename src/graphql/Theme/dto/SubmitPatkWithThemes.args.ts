import {ArgsType, Field} from "@nestjs/graphql";
import {ThemeDataInput} from "./ThemeData.input";
import {PackDataInput} from "./PackData.input";
import {ValidateChild} from "../../common/decorators/ValidateNested.decorator";
import {HBThemeDataInput} from "./HBThemeData.input";
import {ArrayMaxSize} from "class-validator";

@ArgsType()
export class SubmitPackWithThemesArgs {

    @Field()
    makePrivate: boolean;

    @Field(() => PackDataInput)
    @ValidateChild(() => PackDataInput)
    packData: PackDataInput;

    @Field(() => [ThemeDataInput])
    @ArrayMaxSize(25)
    @ValidateChild(() => ThemeDataInput)
    themesData: ThemeDataInput[];

    @Field(() => [HBThemeDataInput])
    @ArrayMaxSize(25)
    @ValidateChild(() => HBThemeDataInput)
    hbthemesData: HBThemeDataInput[];

}
