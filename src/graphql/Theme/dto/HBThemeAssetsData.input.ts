import {Field, InputType} from "@nestjs/graphql";
import {FileUpload, GraphQLUpload} from "graphql-upload";
import {IsOptional} from "class-validator";
import {Exclude} from "class-transformer";

@InputType()
export class HBThemeAssetsDataInput {

    @Field({nullable: true})
    @IsOptional()
    layout?: string;
    @Field(() => GraphQLUpload, {nullable: true})
    @Exclude()
    icon?: Promise<FileUpload>;

    @Field(() => GraphQLUpload, {nullable: true})
    @Exclude()
    batteryIcon?: Promise<FileUpload>;
    @Field(() => GraphQLUpload, {nullable: true})
    @Exclude()
    chargingIcon?: Promise<FileUpload>;
    @Field(() => GraphQLUpload, {nullable: true})
    @Exclude()
    folderIcon?: Promise<FileUpload>;
    @Field(() => GraphQLUpload, {nullable: true})
    @Exclude()
    invalidIcon?: Promise<FileUpload>;
    @Field(() => GraphQLUpload, {nullable: true})
    @Exclude()
    themeIconDark?: Promise<FileUpload>;
    @Field(() => GraphQLUpload, {nullable: true})
    @Exclude()
    themeIconLight?: Promise<FileUpload>;
    @Field(() => GraphQLUpload, {nullable: true})
    @Exclude()
    airplaneIcon?: Promise<FileUpload>;
    @Field(() => GraphQLUpload, {nullable: true})
    @Exclude()
    wifiNoneIcon?: Promise<FileUpload>;
    @Field(() => GraphQLUpload, {nullable: true})
    @Exclude()
    wifi1Icon?: Promise<FileUpload>;
    @Field(() => GraphQLUpload, {nullable: true})
    @Exclude()
    wifi2Icon?: Promise<FileUpload>;
    @Field(() => GraphQLUpload, {nullable: true})
    @Exclude()
    wifi3Icon?: Promise<FileUpload>;
    @Field(() => GraphQLUpload, {nullable: true})
    @Exclude()
    ethIcon?: Promise<FileUpload>;
    @Field(() => GraphQLUpload, {nullable: true})
    @Exclude()
    ethNoneIcon?: Promise<FileUpload>;
    @Field(() => GraphQLUpload, {nullable: true})
    @Exclude()
    backgroundImage?: Promise<FileUpload>;

}