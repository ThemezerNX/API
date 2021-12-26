import {ArgsType, Field} from "@nestjs/graphql";
import {ThemeData} from "./ThemeData.input";
import {ArrayMaxSize, ArrayMinSize} from "class-validator";
import {PackData} from "./PackData.input";
import {ValidateChild} from "../../common/decorators/ValidateNested.decorator";

@ArgsType()
export class SubmitPackWithThemesArgs {

    @Field(() => PackData)
    @ValidateChild(() => PackData)
    packData: PackData;

    @Field(() => [ThemeData])
    @ArrayMinSize(2)
    @ArrayMaxSize(50)
    @ValidateChild(() => ThemeData)
    themesData: ThemeData[];

}
