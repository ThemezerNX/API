import {BaseEntity, SelectQueryBuilder} from "typeorm";
import {ServiceFindOptionsParameter} from "../interfaces/ServiceFindOptions.parameter";

/**
 * Join and selects all relations: Entity[relationProp][prop].
 *
 * @param qb
 * @param options
 */
export function joinAndSelectRelations<QT, ET extends BaseEntity>(qb: SelectQueryBuilder<QT>, options: ServiceFindOptionsParameter<ET>) {
    joinAndSelect(qb, options?.relations || {}, qb.alias);
}

function joinAndSelect(qb, relations, lastAlias) {
    for (const relationProp of (Object.keys(relations || {}))) {
        qb.leftJoinAndSelect(lastAlias + "." + relationProp, relationProp);

        const value = relations[relationProp];
        if (value == true) {
        } else if (Array.isArray(value)) {
            qb.addSelect(value.map((prop) => relationProp + "." + prop));
        } else {
            joinAndSelect(qb, value, relationProp);
        }
    }
}