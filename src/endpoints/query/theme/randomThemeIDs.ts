import {db} from "../../../db/db";
import {errorName} from "../../../util/errorTypes";

export default async (_parent, {target, limit = 1}) => {
    try {
        return await new Promise(async (resolve, reject) => {
            try {
                let query = `
                    SELECT to_hex(id) as id
                    FROM themes
                    WHERE CASE WHEN $1 IS NOT NULL THEN target = $1 ELSE true END
                      AND NOT 'NSFW' = any (categories)
                    ORDER BY random()
                    LIMIT $2`;

                const dbData = await db.many(query, [target, limit]);
                if (dbData.length > 0) {
                    resolve(dbData.map((r) => r.id));
                } else {
                    reject(errorName.NO_CONTENT);
                }
            } catch (e) {
                console.error(e);
                reject(errorName.NO_CONTENT);
            }
        });
    } catch (e) {
        throw new Error(e);
    }
}