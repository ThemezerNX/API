import {I18nErrorInterface} from "../I18n.error.interface";

export class AuthorizationError extends I18nErrorInterface {

    langKey = "AUTHORIZATION_ERROR";

    statusCode = 403;

}