import {I18nErrorInterface} from "./I18n.error.interface";

export class InvalidLayoutIdError extends I18nErrorInterface {

    langKey = "INVALID_ID";

    statusCode = 400;

}