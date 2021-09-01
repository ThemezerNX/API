export abstract class I18nErrorInterface extends Error {

    abstract statusCode: number;

    abstract langKey: string;

    i18nParams: object;

    isTranslatable = true;

}