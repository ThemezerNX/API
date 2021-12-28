import {I18nErrorInterface} from "./I18n.error.interface";

export class InvalidIconAssetError extends I18nErrorInterface {

    langKey = "INVALID_ICON_ASSET";

    statusCode = 400;

}