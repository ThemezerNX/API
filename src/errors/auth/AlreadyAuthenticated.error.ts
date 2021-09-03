import {I18nErrorInterface} from "../I18n.error.interface";

export class AlreadyAuthenticatedError extends I18nErrorInterface {

    langKey = "ALREADY_AUTHENTICATED";

    statusCode = 402;

}