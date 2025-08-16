import {db, pgp} from "../../../db/db";
import {errorName} from "../../../util/errorTypes";

const updatePackCS = new pgp.helpers.ColumnSet(
    [
        {name: "details", cast: "json"},
        {name: "last_updated", cast: "timestamp without time zone"},
    ],
    {
        table: "packs",
    },
);

export default async (
    _parent,
    {id, name, description},
    context,
    _info,
) => {
    if (process.env.READ_ONLY === "true") {
        throw new Error(errorName.READ_ONLY);
    }

    await context.authenticate();

    let mayModerate = false;
    if (context.req.user.roles?.includes("admin")) {
        mayModerate = true;
    } else {
        const pack = await db.oneOrNone(`
            SELECT id
            FROM packs
            WHERE creator_id = $1
              AND id = hex_to_int(\'$2^\')
        `, [context.req.user.id, id]);
        if (pack) mayModerate = true;
    }

    if (mayModerate) {
        return await new Promise(async (resolve, reject) => {
            try {
                const updatedPack = {
                    details: {
                        name,
                        description,
                        color: null,
                    },
                    last_updated: new Date(),
                };

                const query = () => pgp.helpers.update(updatedPack, updatePackCS);

                try {
                    await db.none(query() + ` WHERE id = hex_to_int('$1^')`, [id]);
                    resolve(true);
                } catch (e) {
                    console.error(e);
                    reject(new Error(errorName.DB_SAVE_ERROR));
                    return;
                }
            } catch (e) {
                console.error(e);
                reject(new Error(errorName.UNKNOWN));
            }
        });
    } else {
        throw new Error(errorName.UNAUTHORIZED);
    }
}