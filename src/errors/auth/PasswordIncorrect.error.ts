import {I18nErrorInterface} from "../I18n.error.interface";

export class PasswordIncorrectError extends I18nErrorInterface {

    langKey = "PASSWORD_INCORRECT";

    statusCode = 401;

}