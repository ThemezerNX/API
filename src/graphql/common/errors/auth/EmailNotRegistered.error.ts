import {I18nErrorInterface} from "../I18n.error.interface";

export class EmailNotRegisteredError extends I18nErrorInterface {

    langKey = "EMAIL_NOT_REGISTERED";

    statusCode = 401;

}