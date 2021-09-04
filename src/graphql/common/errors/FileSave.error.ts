import {I18nErrorInterface} from "./I18n.error.interface";

export class FileSaveError extends I18nErrorInterface {

    langKey = "FILE_SAVE_ERROR";

    statusCode = 500;

}