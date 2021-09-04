import {I18nErrorInterface} from "../I18n.error.interface";

export class UserNotFoundError extends I18nErrorInterface {

    langKey = "USER_NOT_EXIST";

    statusCode = 401;

}