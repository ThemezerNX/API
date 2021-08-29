import {I18nErrorInterface} from "./I18n.error.interface";

export class LayoutNotFoundError extends I18nErrorInterface {

    langKey = "LAYOUT_NOT_FOUND";

    statusCode = 404;

}