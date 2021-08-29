import {I18nErrorInterface} from "./I18n.error.interface";

export class FileSizeTooBigError extends I18nErrorInterface {

    langKey = "FILE_TOO_BIG";

    statusCode = 400;

}