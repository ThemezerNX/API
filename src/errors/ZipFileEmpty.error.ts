import {I18nErrorInterface} from "./I18n.error.interface";

export class ZipFileEmptyError extends I18nErrorInterface {

    langKey = "NO_NXTHEMES_IN_ZIP";

    statusCode = 400;

}