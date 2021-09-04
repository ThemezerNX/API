import {I18nErrorInterface} from "./I18n.error.interface";

export class PackCreateError extends I18nErrorInterface {

    langKey = "PACK_CREATE_FAILED";

    statusCode = 500;

}