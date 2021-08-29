import {I18nErrorInterface} from "./I18n.error.interface";

export class LayoutOptionNotFoundError extends I18nErrorInterface {

    langKey = "PIECE_NOT_FOUND";

    statusCode = 404;

}