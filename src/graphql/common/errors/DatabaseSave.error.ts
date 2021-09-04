import {I18nErrorInterface} from "./I18n.error.interface";

export class DatabaseSaveError extends I18nErrorInterface {

    langKey = "DB_SAVE_ERROR";

    statusCode = 500;

}