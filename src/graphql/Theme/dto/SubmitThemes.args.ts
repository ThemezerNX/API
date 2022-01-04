import {ArgsType, Field} from "@nestjs/graphql";
import {ArrayMaxSize} from "class-validator";
import {ValidateChild} from "../../common/decorators/ValidateNested.decorator";
import {PrivatableThemeDataInput} from "./PrivatableThemeData.input";
import {PrivatableHbthemeDataInput} from "./PrivatableHbthemeData.input";

@ArgsType()
export class SubmitThemesArgs {

    @Field(() => [PrivatableThemeDataInput], {nullable: true})
    @ArrayMaxSize(25)
    @ValidateChild(() => PrivatableThemeDataInput)
    themesData?: PrivatableThemeDataInput[] = [];

    @Field(() => [PrivatableHbthemeDataInput], {nullable: true})
    @ArrayMaxSize(25)
    @ValidateChild(() => PrivatableHbthemeDataInput)
    hbthemesData?: PrivatableHbthemeDataInput[] = [];

}
