import {I18nErrorInterface} from "./I18n.error.interface";

export class InvalidScreenshotError extends I18nErrorInterface {

    langKey = "INVALID_SCREENSHOT";

    statusCode = 400;

}