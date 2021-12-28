export abstract class I18nErrorInterface extends Error {

    constructor(i18nParams?: object, message?: string) {
        super(message);
        this.i18nParams = i18nParams;
    }

    abstract statusCode: number;

    abstract langKey: string;

    i18nParams: object;

    isTranslatable = true;

}