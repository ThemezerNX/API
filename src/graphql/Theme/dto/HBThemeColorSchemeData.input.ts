import {Field, InputType} from "@nestjs/graphql";
import {IsHexColor, IsOptional, Length} from "class-validator";
import {HexColorCodeResolver} from "graphql-scalars";

@InputType()
export class HBThemeColorSchemeDataInput {

    isLight: boolean;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @Length(8, 8)
    @IsOptional()
    @IsHexColor()
    textColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @Length(8, 8)
    @IsOptional()
    @IsHexColor()
    frontWaveColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @Length(8, 8)
    @IsOptional()
    @IsHexColor()
    middleWaveColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @Length(8, 8)
    @IsOptional()
    @IsHexColor()
    backWaveColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @Length(8, 8)
    @IsOptional()
    @IsHexColor()
    backgroundColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @Length(8, 8)
    @IsOptional()
    @IsHexColor()
    highlightColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @Length(8, 8)
    @IsOptional()
    @IsHexColor()
    separatorColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @Length(8, 8)
    @IsOptional()
    @IsHexColor()
    borderColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @Length(8, 8)
    @IsOptional()
    @IsHexColor()
    borderTextColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @Length(8, 8)
    @IsOptional()
    @IsHexColor()
    progressBarColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @Length(8, 8)
    @IsOptional()
    @IsHexColor()
    logoColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @Length(8, 8)
    @IsOptional()
    @IsHexColor()
    highlightGradientEdgeColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @Length(8, 8)
    @IsOptional()
    @IsHexColor()
    enableWaveBlending: boolean;

}