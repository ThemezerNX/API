/**
 * Exists operator.
 */
import {SelectQueryBuilder} from "typeorm";

export const Exists = <T>(builder: SelectQueryBuilder<T>) => builder.select("1")
    .limit(1)
    .getRawOne();