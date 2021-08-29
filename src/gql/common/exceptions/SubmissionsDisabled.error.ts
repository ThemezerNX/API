import {I18nErrorInterface} from "./I18n.error.interface";

export class SubmissionsDisabledError extends I18nErrorInterface {

    langKey = "SUBMISSIONS_DISABLED";

    statusCode = 403;

}