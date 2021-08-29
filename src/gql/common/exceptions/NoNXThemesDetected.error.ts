import {I18nErrorInterface} from "./I18n.error.interface";

export class NoNXThemesDetectedError extends I18nErrorInterface {

    langKey = "NO_VALID_NXTHEMES";

    statusCode = 400;

}