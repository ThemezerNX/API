import {I18nErrorInterface} from "./I18n.error.interface";

export class InvalidFileTypeError extends I18nErrorInterface {

    langKey = "INVALID_FILE_TYPE";

    statusCode = 400;

}