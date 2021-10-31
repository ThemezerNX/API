import {I18nErrorInterface} from "./I18n.error.interface";

export class HBThemeNotFoundError extends I18nErrorInterface {

    langKey = "HBTHEME_NOT_FOUND";

    statusCode = 404;

}