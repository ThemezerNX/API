import {I18nErrorInterface} from "./I18n.error.interface";

export class InvalidTargetNameError extends I18nErrorInterface {

    langKey = "INVALID_TARGET_NAME";

    statusCode = 400;

    i18nParams = {
        param1: "targetName",
    };

}