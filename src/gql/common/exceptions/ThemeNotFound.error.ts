import {I18nErrorInterface} from "./I18n.error.interface";

export class ThemeNotFoundError extends I18nErrorInterface {

    langKey = "THEME_NOT_FOUND";

    statusCode = 404;

}