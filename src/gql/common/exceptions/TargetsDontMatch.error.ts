import {I18nErrorInterface} from "./I18n.error.interface";

export class TargetsDontMatchError extends I18nErrorInterface {

    langKey = "TARGETS_DONT_MATCH";

    statusCode = 500;

}