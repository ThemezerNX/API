import {I18nErrorInterface} from "./I18n.error.interface";

export class CreatorNotFoundError extends I18nErrorInterface {

    langKey = "CREATOR_NOT_EXIST";

    statusCode = 404;

}