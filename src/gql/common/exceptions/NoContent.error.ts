import {I18nErrorInterface} from "./I18n.error.interface";

export class NoContentError extends I18nErrorInterface {

    langKey = "NO_CONTENT";

    statusCode = 204;

}