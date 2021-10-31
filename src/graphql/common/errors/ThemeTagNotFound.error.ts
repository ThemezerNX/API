import {I18nErrorInterface} from "./I18n.error.interface";

export class ThemeTagNotFoundError extends I18nErrorInterface {

    langKey = "THEME_TAG_NOT_FOUND";

    statusCode = 404;

}