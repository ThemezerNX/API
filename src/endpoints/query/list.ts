import joinMonster from "join-monster";
import {db} from "../../db/db";
import {filterData, joinMonsterOptions} from "../resolvers";

export default async (_parent, args, context, info) => {
    try {
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