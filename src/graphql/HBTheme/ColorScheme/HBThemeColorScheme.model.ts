import {Field, ObjectType} from "@nestjs/graphql";
import {HexColorCodeResolver} from "graphql-scalars";
import {IsHexColor, Length} from "class-validator";

@ObjectType("HBThemeColorScheme")
export class HBThemeColorSchemeModel {

    @Field(() => HexColorCodeResolver, {nullable: true})
    @IsHexColor()
    @Length(8, 8)
    textColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @IsHexColor()
    @Length(8, 8)
    frontWaveColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @IsHexColor()
    @Length(8, 8)
    middleWaveColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @IsHexColor()
    @Length(8, 8)
    backWaveColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @IsHexColor()
    @Length(8, 8)
    backgroundColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @IsHexColor()
    @Length(8, 8)
    highlightColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @IsHexColor()
    @Length(8, 8)
    separatorColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @IsHexColor()
    @Length(8, 8)
    borderColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @IsHexColor()
    @Length(8, 8)
    borderTextColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @IsHexColor()
    @Length(8, 8)
    progressBarColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @IsHexColor()
    @Length(8, 8)
    logoColor: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @IsHexColor()
    @Length(8, 8)
    highlightGradientEdgeColor: string;

    @Field({nullable: true})
    enableWaveBlending: boolean;

}