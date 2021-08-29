import {I18nErrorInterface} from "./I18n.error.interface";

export class CommonNotAllowedError extends I18nErrorInterface {

    langKey = "NO_COMMON_ALLOWED";

    statusCode = 400;

}