import {Field, InputType} from "@nestjs/graphql";
import {HBThemeDataInput} from "./HBThemeData.input";

@InputType()
export class PrivatableHbthemeDataInput extends HBThemeDataInput {

    @Field()
    makePrivate: boolean;

}