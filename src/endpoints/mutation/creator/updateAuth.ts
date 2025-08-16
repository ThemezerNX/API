import {db} from "../../../db/db";
import {errorName} from "../../../util/errorTypes";

export default async (_parent, {accepts}, context, _info) => {
    if (process.env.READ_ONLY === "true") {
        throw new Error("READ_ONLY mode is enabled.");
    }

    if (await context.authenticate()) {
        let dbData;
        if (accepts) {
            dbData = await db.one(
                `
                    UPDATE creators
                    SET has_accepted = true
                    WHERE id = $1
                    RETURNING has_accepted
                `,
                [context.req.user.id],
            );
        }
        return context.req.user.has_accepted
            ? {
                has_accepted: true,
            }
            : dbData && dbData.has_accepted
                ? {
                    has_accepted: true,
                }
                : {
                    has_accepted: false,
                    backup_code: context.req.user.backup_code,
                };
    } else {
        throw new Error(errorName.UNAUTHORIZED);
    }
}