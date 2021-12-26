import {Field, InputType} from "@nestjs/graphql";
import {JSONResolver} from "graphql-scalars";
import {FileUpload, GraphQLUpload} from "graphql-upload";
import {IsJSON, IsOptional, ValidateIf} from "class-validator";
import {Exclude, Type} from "class-transformer";
import {IsNotDefined} from "../../common/decorators/validators/IsNotDefined";

@InputType()
export class ThemeAssetsData {

    private static ICON_VALIDATION_HOME = "$property cannot be combined with other icons";
    private static ICON_VALIDATION_OTHER = "$property cannot be combined with homeIcon";

    @Field(() => JSONResolver, {nullable: true})
    @IsJSON()
    @IsOptional()
    customLayoutJson?: string;

    @Field(() => JSONResolver, {nullable: true})
    @IsJSON()
    @IsOptional()
    customCommonLayoutJson?: string;

    @Field(() => GraphQLUpload, {nullable: true})
    @Exclude()
    image?: Promise<FileUpload>;

    @Field(() => GraphQLUpload, {nullable: true})
    @ValidateIf((o: ThemeAssetsData) => o.homeIcon != null)
    @Type(() => String)
    @IsNotDefined({message: ThemeAssetsData.ICON_VALIDATION_OTHER})
    albumIcon?: Promise<FileUpload>;

    @Field(() => GraphQLUpload, {nullable: true})
    @ValidateIf((o: ThemeAssetsData) => o.homeIcon != null)
    @Type(() => String)
    @IsNotDefined({message: ThemeAssetsData.ICON_VALIDATION_OTHER})
    newsIcon?: Promise<FileUpload>;

    @Field(() => GraphQLUpload, {nullable: true})
    @ValidateIf((o: ThemeAssetsData) => o.homeIcon != null)
    @Type(() => String)
    @IsNotDefined({message: ThemeAssetsData.ICON_VALIDATION_OTHER})
    shopIcon?: Promise<FileUpload>;

    @Field(() => GraphQLUpload, {nullable: true})
    @ValidateIf((o: ThemeAssetsData) => o.homeIcon != null)
    @Type(() => String)
    @IsNotDefined({message: ThemeAssetsData.ICON_VALIDATION_OTHER})
    controllerIcon?: Promise<FileUpload>;

    @Field(() => GraphQLUpload, {nullable: true})
    @ValidateIf((o: ThemeAssetsData) => o.homeIcon != null)
    @Type(() => String)
    @IsNotDefined({message: ThemeAssetsData.ICON_VALIDATION_OTHER})
    settingsIcon?: Promise<FileUpload>;

    @Field(() => GraphQLUpload, {nullable: true})
    @ValidateIf((o: ThemeAssetsData) => o.homeIcon != null)
    @Type(() => String)
    @IsNotDefined({message: ThemeAssetsData.ICON_VALIDATION_OTHER})
    powerIcon?: Promise<FileUpload>;

    @Field(() => GraphQLUpload, {nullable: true})
    @ValidateIf((o: ThemeAssetsData) => o.albumIcon != null || o.newsIcon != null || o.shopIcon != null || o.controllerIcon != null || o.controllerIcon != null || o.powerIcon != null)
    @Type(() => String)
    @IsNotDefined({message: ThemeAssetsData.ICON_VALIDATION_HOME})
    homeIcon?: Promise<FileUpload>;

}