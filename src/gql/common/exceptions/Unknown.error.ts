import {I18nErrorInterface} from "./I18n.error.interface";

export class UnknownError extends I18nErrorInterface {

    langKey = "UNKNOWN"

    statusCode = 500;

}