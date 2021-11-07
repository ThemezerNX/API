import {applyDecorators} from "@nestjs/common";
import {Type, TypeHelpOptions, TypeOptions} from "class-transformer";
import {ValidateNested} from "class-validator";

export function ValidateChild(typeFunction?: (type?: TypeHelpOptions) => Function, options?: TypeOptions) {
    return applyDecorators(
        ValidateNested(),
        Type(typeFunction, options),
    );
}