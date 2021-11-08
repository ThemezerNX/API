import {Field, ObjectType} from "@nestjs/graphql";
import {RootModelAbstract} from "../../common/interfaces/Root.model.abstract";


@ObjectType("UserPreferences")
export class UserPreferencesModel extends RootModelAbstract {

    @Field()
    showNSFW: boolean;

    @Field()
    popularEmails: boolean;

    @Field()
    promotionEmails: boolean;

}