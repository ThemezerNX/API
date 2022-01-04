import {Field, InputType} from "@nestjs/graphql";
import {ThemeDataInput} from "./ThemeData.input";

@InputType()
export class PrivatableThemeDataInput extends ThemeDataInput {

    @Field()
    makePrivate: boolean;

}