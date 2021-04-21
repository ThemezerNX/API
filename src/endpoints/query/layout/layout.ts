import joinMonster from "join-monster";
import {db} from "../../../db/db";
import {errorName} from "../../../util/errorTypes";
import {joinMonsterOptions} from "../../resolvers";

export default async (_parent, _args, context, info) => {
    return await new Promise(async (resolve, reject) => {
        try {
            const dbData = await joinMonster(
                info,
                context,
                (sql) => {
                    return db.any(sql);
                },
                joinMonsterOptions,
            );

            if (dbData) {
                resolve(dbData);
            } else {
                reject(errorName.LAYOUT_NOT_FOUND);
            }
        } catch (e) {
            console.error(e);
            reject(errorName.LAYOUT_NOT_FOUND);
        }
    });
}