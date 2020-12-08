import joinMonster from "join-monster";
import {db} from "../../db/db";
import {errorName} from "../../util/errorTypes";
import {joinMonsterOptions} from "../resolvers";

export default async (_parent, _args, context, info) => {
    try {
        return await new Promise(async (resolve, reject) => {
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
                reject(errorName.CREATOR_NOT_EXIST);
            }
        });
    } catch (e) {
        throw new Error(e);
    }
}