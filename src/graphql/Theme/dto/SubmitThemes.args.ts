import {ArgsType, Field} from "@nestjs/graphql";
import {ThemeData} from "./ThemeData.input";
import {ArrayMaxSize, ArrayMinSize} from "class-validator";
import {ValidateChild} from "../../common/decorators/ValidateNested.decorator";

@ArgsType()
export class SubmitThemesArgs {

    @Field(() => [ThemeData])
    @ArrayMinSize(1)
    @ArrayMaxSize(50)
    @ValidateChild(() => ThemeData)
    themesData: ThemeData[];

}
