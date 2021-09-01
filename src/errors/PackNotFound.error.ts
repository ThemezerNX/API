import {I18nErrorInterface} from "./I18n.error.interface";

export class PackNotFoundError extends I18nErrorInterface {

    langKey = "PACK_NOT_FOUND";

    statusCode = 404;

}