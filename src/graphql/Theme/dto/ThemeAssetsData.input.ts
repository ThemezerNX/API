import {Field, InputType} from "@nestjs/graphql";
import {JSONResolver} from "graphql-scalars";
import {FileUpload, GraphQLUpload} from "graphql-upload";
import {IsJSON, IsOptional, ValidateIf} from "class-validator";
import {Exclude, Type} from "class-transformer";
import {IsNotDefined} from "../../common/decorators/validators/IsNotDefined";

@InputType()
export class ThemeAssetsDataInput {

    private static ICON_VALIDATION_HOME = "$property cannot be combined with other icons";
    private static ICON_VALIDATION_OTHER = "$property cannot be combined with homeIcon";
    private static ICON_DESCRIPTION = "$property must be a png of size 64x56";

    @Field(() => JSONResolver, {nullable: true})
    @IsJSON()
    @IsOptional()
    customLayoutJson?: string;

    @Field(() => JSONResolver, {nullable: true})
    @IsJSON()
    @IsOptional()
    customCommonLayoutJson?: string;

    @Field(() => GraphQLUpload, {nullable: true, description: "backgroundImage must be jpg of size 1280x720"})
    @Exclude()
    backgroundImage?: Promise<FileUpload>;

    @Field(() => GraphQLUpload, {nullable: true, description: ThemeAssetsDataInput.ICON_DESCRIPTION})
    @ValidateIf((o: ThemeAssetsDataInput) => o.homeIcon != null)
    @Type(() => String)
    @IsNotDefined({message: ThemeAssetsDataInput.ICON_VALIDATION_OTHER})
    albumIcon?: Promise<FileUpload>;

    @Field(() => GraphQLUpload, {nullable: true, description: ThemeAssetsDataInput.ICON_DESCRIPTION})
    @ValidateIf((o: ThemeAssetsDataInput) => o.homeIcon != null)
    @Type(() => String)
    @IsNotDefined({message: ThemeAssetsDataInput.ICON_VALIDATION_OTHER})
    newsIcon?: Promise<FileUpload>;

    @Field(() => GraphQLUpload, {nullable: true, description: ThemeAssetsDataInput.ICON_DESCRIPTION})
    @ValidateIf((o: ThemeAssetsDataInput) => o.homeIcon != null)
    @Type(() => String)
    @IsNotDefined({message: ThemeAssetsDataInput.ICON_VALIDATION_OTHER})
    shopIcon?: Promise<FileUpload>;

    @Field(() => GraphQLUpload, {nullable: true, description: ThemeAssetsDataInput.ICON_DESCRIPTION})
    @ValidateIf((o: ThemeAssetsDataInput) => o.homeIcon != null)
    @Type(() => String)
    @IsNotDefined({message: ThemeAssetsDataInput.ICON_VALIDATION_OTHER})
    controllerIcon?: Promise<FileUpload>;

    @Field(() => GraphQLUpload, {nullable: true, description: ThemeAssetsDataInput.ICON_DESCRIPTION})
    @ValidateIf((o: ThemeAssetsDataInput) => o.homeIcon != null)
    @Type(() => String)
    @IsNotDefined({message: ThemeAssetsDataInput.ICON_VALIDATION_OTHER})
    settingsIcon?: Promise<FileUpload>;

    @Field(() => GraphQLUpload, {nullable: true, description: ThemeAssetsDataInput.ICON_DESCRIPTION})
    @ValidateIf((o: ThemeAssetsDataInput) => o.homeIcon != null)
    @Type(() => String)
    @IsNotDefined({message: ThemeAssetsDataInput.ICON_VALIDATION_OTHER})
    powerIcon?: Promise<FileUpload>;

    @Field(() => GraphQLUpload, {nullable: true, description: ThemeAssetsDataInput.ICON_DESCRIPTION})
    @ValidateIf((o: ThemeAssetsDataInput) => o.albumIcon != null || o.newsIcon != null || o.shopIcon != null || o.controllerIcon != null || o.controllerIcon != null || o.powerIcon != null)
    @Type(() => String)
    @IsNotDefined({message: ThemeAssetsDataInput.ICON_VALIDATION_HOME})
    homeIcon?: Promise<FileUpload>;

}