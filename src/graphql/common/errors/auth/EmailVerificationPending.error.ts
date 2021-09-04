import {I18nErrorInterface} from "../I18n.error.interface";

export class EmailVerificationPendingError extends I18nErrorInterface {

    langKey = "EMAIL_VERIFICATION_PENDING";

    statusCode = 401;

}