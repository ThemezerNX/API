import {I18nErrorInterface} from "../I18n.error.interface";

export class UnauthorizedError extends I18nErrorInterface {

    langKey = "UNAUTHORIZED";

    statusCode = 401;

}