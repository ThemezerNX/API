import {I18nErrorInterface} from "../I18n.error.interface";

export class UnauthenticatedError extends I18nErrorInterface {

    langKey = "UNAUTHENTICATED";

    statusCode = 401;

}