import {I18nErrorInterface} from "./I18n.error.interface";

export class ZipFileReadError extends I18nErrorInterface {

    langKey = "ZIP_READ_ERROR";

    statusCode = 500;

}