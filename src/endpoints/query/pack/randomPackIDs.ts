import {db} from "../../../db/db";
import {errorName} from "../../../util/errorTypes";

export default async (_parent, {limit = 1}) => {
    try {
        return await new Promise(async (resolve, reject) => {
            try {
                let query = `
                    SELECT to_hex(id) as id
                    FROM packs
                    WHERE (
                              SELECT id
                              FROM themes
                              WHERE pack_id = packs.id
                                AND 'NSFW' = any (categories)
                              LIMIT 1
                          ) IS NULL
                    ORDER BY random()
                    LIMIT $1`

                const dbData = await db.many(query, [limit])
                if (dbData.length > 0) {
                    resolve(dbData.map((r) => r.id))
                } else {
                    reject(errorName.NO_CONTENT)
                }
            } catch (e) {
                console.error(e)
                reject(errorName.NO_CONTENT)
            }
        })
    } catch (e) {
        throw new Error(e)
    }
}