import {Field, InputType} from "@nestjs/graphql";
import {ArrayMaxSize, ArrayMinSize, IsHexadecimal, IsOptional, IsString, Length} from "class-validator";
import {FileUpload, GraphQLUpload} from "graphql-upload";
import {Target} from "../../common/enums/Target";
import {ThemeAssetsData} from "./ThemeAssetsData.input";
import {Exclude} from "class-transformer";
import {ValidateChild} from "../../common/decorators/ValidateNested.decorator";
import {ChosenLayoutOptionValue} from "../../Layout/dto/ChosenLayoutOptionValue.input";

@InputType()
export class ThemeData {

    @Length(3, 100)
    @Field()
    name: string;

    @Field({nullable: true})
    @Length(10, 1000)
    @IsOptional()
    description?: string;

    @Field(() => Target)
    target: Target;

    @Field({
        defaultValue: false,
        description: "Whether the theme is NSFW. Note: if one of the themes in a pack is NSFW, the pack will be treated as NSFW.",
    })
    isNSFW: boolean = false;

    @Field({
        nullable: true,
        description: "If there is no layout id, the default layout (the stock Nintendo one) for the target will be selected. A completely custom json can be provided in the assets.",
    })
    @IsHexadecimal()
    @IsOptional()
    layoutId?: string;

    @Field(() => [String],
        {description: "Unknown tags will be created. Comparison with existing tags is case-insensitive."})
    @ArrayMinSize(1)
    @ArrayMaxSize(10)
    @IsString({each: true})
    @Length(2, 60, {each: true})
    tags: string[];

    @Exclude()
    @Field(() => GraphQLUpload, {description: "A theme screenshot. Must be taken on the Switch."})
    screenshot: Promise<FileUpload>;

    @Field(() => [ChosenLayoutOptionValue], {nullable: true})
    @ValidateChild(() => ChosenLayoutOptionValue)
    options: ChosenLayoutOptionValue[] = [];

    @Field(() => ThemeAssetsData, {nullable: true})
    @ValidateChild(() => ThemeAssetsData)
    @IsOptional()
    assets?: ThemeAssetsData;

}