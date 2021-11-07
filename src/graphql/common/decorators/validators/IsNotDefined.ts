/**
 * Checks if value is defined (!== undefined, !== null).
 */
import {buildMessage, ValidateBy, ValidationOptions} from "class-validator";

export function isNotDefined(value: any): boolean {
    return value === null || value === undefined;
}

/**
 * Checks if value is defined (!== undefined, !== null).
 */
export function IsNotDefined(validationOptions?: ValidationOptions): PropertyDecorator {
    return ValidateBy(
        {
            name: "isNotDefined",
            validator: {
                validate: (value): boolean => isNotDefined(value),
                defaultMessage: buildMessage(
                    eachPrefix => eachPrefix + '$property should be null or undefined',
                    validationOptions
                ),
            },
        },
        validationOptions
    );
}