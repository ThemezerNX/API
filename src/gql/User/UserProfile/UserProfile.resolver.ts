import {Parent, ResolveField, Resolver} from "@nestjs/graphql";
import {UserProfileModel} from "./UserProfile.model";


@Resolver(UserProfileModel)
export class UserProfileResolver {

    // @ResolveField()
    // avatar(@Parent() userProfile: UserProfileModel): string {
    //     return userProfile.hasAvatar ? `//cdn.themezer.net/creators/${userProfile.userId}/avatar?${userProfile.randomUuid}` : null;
    // }
    //
    // @ResolveField()
    // banner(@Parent() userProfile: UserProfileModel): string {
    //     return userProfile.hasBanner ? `//cdn.themezer.net/creators/${userProfile.userId}/banner?${userProfile.randomUuid}` : null;
    // }

}