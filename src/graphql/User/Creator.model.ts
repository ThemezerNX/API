import {Field, ID, ObjectType} from "@nestjs/graphql";
import {UserProfileModel} from "./Profile/UserProfile.model";
import {UserConnectionsModel} from "./Connections/UserConnections.model";


@ObjectType("Creator")
export class CreatorModel {

    @Field(() => ID)
    id: string;

    @Field()
    username: string;

    @Field()
    joinedTimestamp: Date;

    @Field()
    isAdmin: boolean;

    @Field(() => [String])
    roles: string[];

    @Field(() => UserProfileModel)
    profile: UserProfileModel;

    @Field(() => UserConnectionsModel)
    connections: UserConnectionsModel;

}
