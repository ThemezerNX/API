import {I18nErrorInterface} from "./I18n.error.interface";

export class InvalidThemeContentsError extends I18nErrorInterface {

    langKey = "INVALID_THEME_CONTENTS";

    statusCode = 400;

}