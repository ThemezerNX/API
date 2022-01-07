import {ArgsType, Field} from "@nestjs/graphql";
import {IsHexadecimal} from "class-validator";
import {HexadecimalResolver} from "graphql-scalars";

@ArgsType()
export class ModifyPackContentsArgs {

    @Field(() => HexadecimalResolver)
    @IsHexadecimal()
    id: string;

    @Field(() => [HexadecimalResolver], {defaultValue: []})
    @IsHexadecimal({each: true})
    themeIds: string[];

    @Field(() => [HexadecimalResolver], {defaultValue: []})
    @IsHexadecimal({each: true})
    hbthemeIds: string[];

}