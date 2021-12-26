import {I18nErrorInterface} from "./I18n.error.interface";

export class InvalidImageError extends I18nErrorInterface {

    langKey = "INVALID_IMAGE";

    statusCode = 400;

}