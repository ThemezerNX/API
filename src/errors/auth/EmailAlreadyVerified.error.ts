import {I18nErrorInterface} from "../I18n.error.interface";

export class EmailAlreadyVerifiedError extends I18nErrorInterface {

    langKey = "EMAIL_ALREADY_VERIFIED";

    statusCode = 400;

}