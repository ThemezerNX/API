import joinMonster from "join-monster";
import {db} from "../../db/db";
import {errorName} from '../../util/errorTypes'
import {filterData, joinMonsterOptions} from "../resolvers";

export default async (_parent, args, context, info) => {
    try {
        if (args.order && !(args.order.toLowerCase() === 'asc' || args.order.toLowerCase() === 'desc')) {
            throw errorName.INVALID_ORDER
        }

        return await new Promise(async (resolve, reject) => {
            let dbData = await joinMonster(
                info,
                context,
                (sql) => {
                    return db.any(sql)
                },
                joinMonsterOptions
            )

            try {
                const filtered = filterData(dbData, info, args)
                context.pagination = filtered.pagination
                resolve(filtered.items)
            } catch (e) {
                reject(e)
            }
        })
    } catch (e) {
        console.error(e)
        throw new Error(e)
    }
}