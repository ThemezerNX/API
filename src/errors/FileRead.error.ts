import {I18nErrorInterface} from "./I18n.error.interface";

export class FileReadError extends I18nErrorInterface {

    langKey = "FILE_READ_ERROR";

    statusCode = 500;

}