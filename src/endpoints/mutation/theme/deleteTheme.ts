import {db} from "../../../db/db";
import {fileNameToWebName} from "../../../util/targetParser";
import {errorName} from "../../../util/errorTypes";
import {storagePath} from "../../resolvers";
import rimraf from "rimraf";

export default async (_parent, {id}, context, _info) => {
    return await new Promise(async (resolve, reject) => {
        if (await context.authenticate()) {
            try {
                const dbData = await db.one(
                    `
                        DELETE
                        FROM themes CASCADE
                        WHERE ("cascade".creator_id = $1 OR $3)
                          AND "cascade".id = hex_to_int('$2^')
                        RETURNING to_hex("cascade".id) as id, "cascade".pack_id, (
                            SELECT array_agg(id)
                            FROM themes
                            WHERE pack_id IS NOT NULL
                              AND pack_id = "cascade".pack_id
                        ) as ids;
                    `,
                    [context.req.user.id, id, context.req.user.roles?.includes("admin")],
                );
                rimraf(`${storagePath}/themes/${dbData.id}`, () => {
                });

                // This stuff is for redirecting to the single theme left's page. The pack is removed if there's only one theme left in it.
                if (dbData.pack_id && dbData.ids.length <= 2) {
                    const lastTheme = await db.one(
                        `
                            UPDATE themes
                            SET pack_id = NULL
                            WHERE pack_id = $1
                            RETURNING to_hex(id) as id, target
                        `,
                        [dbData.pack_id],
                    );
                    await db.none(
                        `
                            DELETE
                            FROM packs
                            WHERE id = $1;
                        `,
                        [dbData.pack_id],
                    );
                    resolve(`/themes/${fileNameToWebName(lastTheme.target)}/${lastTheme.id}`);
                } else resolve(null);
            } catch (e) {
                console.error(e);
                reject(new Error(errorName.THEME_NOT_FOUND));
            }
        } else {
            throw new Error(errorName.UNAUTHORIZED);
        }
    });
}