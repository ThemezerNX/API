/**
 * Advanced Find Options Operator.
 * Example: { someField: ILike("%SOME string%") }
 */
import {FindOperator, Raw} from "typeorm";


export function StringContains<T>(value: T | FindOperator<T>) {
    return Raw((alias) => `position(lower(:value) IN lower(${alias})) > 0`, {value});
}