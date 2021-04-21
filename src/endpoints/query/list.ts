import joinMonster from "join-monster";
import {db} from "../../db/db";
import {errorName} from "../../util/errorTypes";
import {joinMonsterOptions, paginateData, sortOptions} from "../resolvers";

export default async (_parent, args, context, info) => {
    if (args.order && !(args.order.toLowerCase() === "asc" || args.order.toLowerCase() === "desc")) {
        throw new Error(errorName.INVALID_ORDER);
    }

    // If an unknown sort value is specified, throw an error
    const sortOption = sortOptions.find((o) => o.id === args.sort);
    if (args.sort && !sortOption) {
        throw new Error(errorName.INVALID_SORT);
    }

    return await new Promise(async (resolve, reject) => {
        let dbData = await joinMonster(
            info,
            context,
            (sql) => {
                return db.any(sql);
            },
            joinMonsterOptions,
        );

        try {
            const filtered = paginateData(dbData, info, args);
            context.pagination = filtered.pagination;
            resolve(filtered.items);
        } catch (e) {
            reject(e);
        }
    });
}