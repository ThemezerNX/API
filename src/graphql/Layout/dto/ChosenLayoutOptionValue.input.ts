import {Field, InputType} from "@nestjs/graphql";
import {IsDecimal, IsHexColor, IsInt, IsNotEmpty, IsOptional, IsUUID, Length} from "class-validator";
import {HexColorCodeResolver} from "graphql-scalars";

@InputType()
export class ChosenLayoutOptionValue {

    private static ONLY_APPLICCABLE = "Only the applicable value field is required.";

    @Field({nullable: true})
    @IsUUID()
    uuid: string;

    @Field({nullable: true, description: ChosenLayoutOptionValue.ONLY_APPLICCABLE})
    @IsInt()
    @IsOptional()
    integerValue?: number;

    @Field({nullable: true, description: ChosenLayoutOptionValue.ONLY_APPLICCABLE})
    @IsDecimal()
    @IsOptional()
    decimalValue?: number;

    @Field({nullable: true, description: ChosenLayoutOptionValue.ONLY_APPLICCABLE})
    @IsNotEmpty()
    @IsOptional()
    stringValue?: string;

    @Field(() => HexColorCodeResolver, {nullable: true, description: ChosenLayoutOptionValue.ONLY_APPLICCABLE})
    @IsHexColor()
    @Length(8, 8) // TODO: check if this works
    @IsOptional()
    colorValue?: string;

}