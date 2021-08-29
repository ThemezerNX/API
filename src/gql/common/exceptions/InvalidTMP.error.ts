import {I18nErrorInterface} from "./I18n.error.interface";

export class InvalidTMPError extends I18nErrorInterface {

    langKey = "INVALID_TMP";

    statusCode = 400;

}