import {Field, InputType} from "@nestjs/graphql";
import {IsDecimal, IsHexColor, IsInt, IsNotEmpty, IsUUID, Length} from "class-validator";

@InputType()
export class ChosenLayoutOptionValue {

    @Field({nullable: true})
    @IsUUID()
    uuid: string;

    @Field({nullable: true, description: "Only one of the value fields is required."})
    @IsInt()
    integerValue?: number;

    @Field({nullable: true, description: "Only one of the value fields is required."})
    @IsDecimal()
    decimalValue?: number;

    @Field({nullable: true, description: "Only one of the value fields is required."})
    @IsNotEmpty()
    stringValue?: string;

    @Field({nullable: true, description: "Only one of the value fields is required."})
    @IsHexColor()
    @Length(8, 8) // TODO: check if this works
    colorValue?: string;

}