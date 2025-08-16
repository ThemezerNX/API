import {errorName} from "../../util/errorTypes";
import {db} from "../../db/db";

export default async (_parent, {type, id, value}, context, _info) => {
    if (process.env.READ_ONLY === "true") {
        throw new Error("READ_ONLY mode is enabled.");
    }

    const typeLowercase = type.toLowerCase();
    if (!["creators", "layouts", "themes", "packs"].includes(typeLowercase))
        return new Error(errorName.INVALID_FIELD);

    if (await context.authenticate()) {
        return await new Promise(async (resolve) => {
            if (value === true) {
                // Add like
                await db.none(
                    `
                        UPDATE creators
                        SET liked_${typeLowercase} = array_append(liked_${typeLowercase}, ${
                                typeLowercase === "creators" ? "$2" : "hex_to_int('$2^')"
                        })
                        WHERE id = $1
                          AND (liked_${typeLowercase} IS NULL OR NOT ${
                                typeLowercase === "creators" ? "$2" : "hex_to_int('$2^')"
                        } = ANY (liked_${typeLowercase}))
                    `,
                    [context.req.user.id, id],
                );
            } else {
                // Remove like
                await db.none(
                    `
                        UPDATE creators
                        SET liked_${typeLowercase} = array_remove(liked_${typeLowercase}, ${typeLowercase === "creators" ? "$2" : "hex_to_int('$2^')"})
                        WHERE id = $1
                          AND liked_${typeLowercase} IS NOT NULL
                          AND ${typeLowercase === "creators" ? "$2" : "hex_to_int('$2^')"} = ANY (liked_${typeLowercase})
                    `,
                    [context.req.user.id, id],
                );
            }

            resolve(true);
        });
    } else {
        throw new Error(errorName.UNAUTHORIZED);
    }
}