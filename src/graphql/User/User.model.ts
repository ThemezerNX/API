import {IsEmail} from "class-validator";
import {EmailAddressResolver} from "graphql-scalars";
import {Field, ID, ObjectType} from "@nestjs/graphql";
import {UserProfileModel} from "./UserProfile/UserProfile.model";
import {UserPreferencesModel} from "./UserPreferences/UserPreferences.model";
import {UserConnectionsModel} from "./UserConnections/UserConnections.model";


@ObjectType("User")
export class UserModel {

    @Field(() => ID)
    id: string;

    @Field(() => EmailAddressResolver, {nullable: true})
    @IsEmail()
    email?: string;

    @Field()
    username: string;

    @Field()
    joinedTimestamp: Date;

    @Field()
    hasAccepted: boolean;

    @Field()
    isAdmin: boolean;

    @Field()
    isBlocked: boolean;

    @Field(() => [String])
    roles: string[];

    @Field(() => UserProfileModel)
    profile: UserProfileModel;

    @Field(() => UserPreferencesModel)
    preferences: UserPreferencesModel;

    @Field(() => UserConnectionsModel)
    connections: UserConnectionsModel;

}
