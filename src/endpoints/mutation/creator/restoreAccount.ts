import {db} from "../../../db/db";
import {errorName} from "../../../util/errorTypes";

export default async (_parent, {creator_id, backup_code}, context, _info) => {
    if (process.env.READ_ONLY === "true") {
        throw new Error("READ_ONLY mode is enabled.");
    }

    if (await context.authenticate()) {
        const dbData = await db.oneOrNone(
            `
                WITH valid AS (
                    SELECT case when count(*) > 0 then true else false end
                    FROM creators
                    WHERE id = $3
                      AND backup_code = $4
                ),
                     new_creator AS (
                         DELETE FROM creators
                             WHERE id = $1
                                 AND (SELECT * FROM valid)
                             RETURNING id
                     ),
                     restored AS (
                         UPDATE creators
                             SET id = (select id from new_creator),
                                 has_accepted = false,
                                 discord_user = $2,
                                 backup_code = md5(random()::varchar)::varchar,
                                 old_ids = array_append(old_ids, $3)
                             WHERE id = $3
                                 AND (SELECT * FROM valid)
                             RETURNING id
                     )

                SELECT *
                FROM restored
            `,
            [context.req.user.id, context.req.user.discord_user, creator_id, backup_code],
        );
        return !!dbData;
    } else {
        throw new Error(errorName.UNAUTHORIZED);
    }
}