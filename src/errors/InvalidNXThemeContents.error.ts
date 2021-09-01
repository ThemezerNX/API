import {I18nErrorInterface} from "./I18n.error.interface";

export class InvalidNXThemeContentsError extends I18nErrorInterface {

    langKey = "INVALID_NXTHEME_CONTENTS";

    statusCode = 400;

}