/**
 * Checks if value is an actual userId.
 */
import {buildMessage, ValidateBy, ValidationOptions} from "class-validator";

export function isUserId(value: any): boolean {
    return value != undefined && typeof value === "string" && value.length === 19;
}

/**
 * Checks if value is correct.
 */
export function IsUserId(validationOptions?: ValidationOptions): PropertyDecorator {
    return ValidateBy(
        {
            name: "isUserId",
            validator: {
                validate: (value): boolean => isUserId(value),
                defaultMessage: buildMessage(
                    eachPrefix => eachPrefix + '$property must be a valid user id',
                    validationOptions
                ),
            },
        },
        validationOptions
    );
}