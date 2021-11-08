import {IsEmail} from "class-validator";
import {EmailAddressResolver} from "graphql-scalars";
import {Field, ObjectType} from "@nestjs/graphql";
import {UserPreferencesModel} from "./Preferences/UserPreferences.model";
import {Expose} from "class-transformer";
import {CreatorModel} from "./Creator.model";


@ObjectType("User")
export class UserModel extends CreatorModel {

    @Field(() => EmailAddressResolver, {nullable: true})
    @IsEmail()
    @Expose({groups: ["owner", "admin"], toPlainOnly: true})
    email?: string;

    @Field()
    hasAccepted: boolean;

    @Field({nullable: true})
    @Expose({groups: ["admin"], toPlainOnly: true})
    isBlocked?: boolean;

    @Field(() => UserPreferencesModel, {nullable: true})
    @Expose({groups: ["admin", "owner"], toPlainOnly: true})
    preferences?: UserPreferencesModel;

}
