import {I18nErrorInterface} from "../I18n.error.interface";

export class AlreadyAuthenticatedError extends I18nErrorInterface {

    langKey = "ALREADY_AUTHORIZED";

    statusCode = 402;

}