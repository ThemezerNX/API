import {I18nErrorInterface} from "../I18n.error.interface";

export class SubmissionsBlockedError extends I18nErrorInterface {

    langKey = "SUBMITTING_BLOCKED";

    statusCode = 401;

}