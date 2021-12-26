import {I18nErrorInterface} from "./I18n.error.interface";

export class InvalidIconError extends I18nErrorInterface {

    langKey = "INVALID_ICON";

    statusCode = 400;

}