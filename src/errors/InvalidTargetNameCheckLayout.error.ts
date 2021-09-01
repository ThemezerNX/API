import {I18nErrorInterface} from "./I18n.error.interface";

export class InvalidTargetNameCheckLayoutError extends I18nErrorInterface {

    langKey = "INVALID_TARGET_NAME_CHECK_LAYOUT";

    statusCode = 400;

    i18nParams = {
        param1: "targetName",
    };

}