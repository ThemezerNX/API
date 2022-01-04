/**
 * Exists operator.
 */
import {SelectQueryBuilder} from "typeorm";
import {ItemVisibility} from "../enums/ItemVisibility";

export const addPrivateCondition = <T>(builder: SelectQueryBuilder<T>, {currentUserId, forceSelect}: ItemVisibility) =>
    builder.andWhere(`("${builder.alias}"."isPrivate" OR "${builder.alias}"."creatorId" = :currentUserId OR :forceSelect)`, {currentUserId, forceSelect});
