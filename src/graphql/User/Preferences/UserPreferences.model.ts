import {Field, ObjectType} from "@nestjs/graphql";
import {RootModelAbstract} from "../../common/interfaces/Root.model.abstract";


@ObjectType("UserPreferences")
export class UserPreferencesModel extends RootModelAbstract {

    @Field()
    showNSFW: boolean;

    @Field({description: "Whether to receive emails about new notifications"})
    notificationEmails: boolean;

    @Field({description: "Whether to receive promational emails"})
    promotionEmails: boolean;

}