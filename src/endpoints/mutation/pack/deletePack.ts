import {db} from "../../../db/db";
import {errorName} from "../../../util/errorTypes";
import {storagePath} from "../../resolvers";
import rimraf from "rimraf";

export default async (_parent, {id}, context, _info) => {
    if (process.env.READ_ONLY === "true") {
        throw new Error(errorName.READ_ONLY);
    }

    return await new Promise(async (resolve, reject) => {
        if (await context.authenticate()) {
            try {
                const dbData = await db.one(
                    `
                        DELETE
                        FROM packs CASCADE
                        WHERE (creator_id = $1 OR $3)
                          AND id = hex_to_int('$2^')
                        RETURNING (
                            SELECT array_agg(to_hex(id))
                            FROM themes
                            WHERE pack_id = hex_to_int('$2^')
                        ) as ids;
                    `,
                    [context.req.user.id, id, context.req.user.roles?.includes("admin")],
                );
                dbData.ids.forEach((id) => {
                    rimraf(`${storagePath}/themes/${id}`, () => {
                    });
                });
                resolve(true);
            } catch (e) {
                console.error(e);
                reject(new Error(errorName.PACK_NOT_FOUND));
            }
        } else {
            reject(new Error(errorName.UNAUTHORIZED));
        }
    });
}