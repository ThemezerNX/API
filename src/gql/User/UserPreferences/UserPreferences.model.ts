import {Field, ObjectType} from "@nestjs/graphql";


@ObjectType()
export class UserPreferencesModel {

    @Field()
    showNSFW: boolean;

    @Field()
    popularEmails: boolean;

    @Field()
    promotionEmails: boolean;

}