import {I18nErrorInterface} from "../I18n.error.interface";

export class EmailAlreadyRegisteredError extends I18nErrorInterface {

    langKey = "EMAIL_ALREADY_REGISTERED";

    statusCode = 400;

}