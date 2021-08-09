import {db} from "../../../util/db";
import {errorName} from "../../../util/errorTypes";

export default async (_parent, {limit = 1}) => {
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
                LIMIT $1`;

            const dbData = await db.many(query, [limit]);
            if (dbData.length > 0) {
                resolve(dbData.map((r) => r.id));
            } else {
                reject(new Error(errorName.NO_CONTENT));
            }
        } catch (e) {
            console.error(e);
            reject(new Error(errorName.NO_CONTENT));
        }
    });
}