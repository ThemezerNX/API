import joinMonster from "join-monster";
import {db} from "../../db/db";
import {errorName} from "../../util/errorTypes";
import {joinMonsterOptions, sortOptions} from "../resolvers";

const graphqlFields = require("graphql-fields");

const defaultLimit = 20;

export default async (_parent, args, context, info) => {
    if (args.order && (args.order.length === 0 || !(args.order.toLowerCase() === "asc" || args.order.toLowerCase() === "desc"))) {
        throw new Error(errorName.INVALID_ORDER);
    }

    // If an unknown sort value is specified, throw an error
    const sortOption = sortOptions.find((o) => o.id === args.sort);
    if (args.sort && !sortOption) {
        throw new Error(errorName.INVALID_SORT);
    } else {
        const queryFields = graphqlFields(info);
        if (args.sort === "likes" && !queryFields.like_count) {
            throw new Error(errorName.CANNOT_SORT_BY_LIKES);
        }
    }

    return await new Promise(async (resolve, reject) => {
        const limit = args?.limit >= 0 ? args.limit : defaultLimit;
        const page = args?.page > 0 ? args.page : 1;
        const offset = limit * (page - 1);
        let item_count;

        const dbData = await joinMonster(
            info,
            context,
            async (sql) => {
                const paginatedSql = `
                        WITH paginate AS (
                            ${sql}
                        )
                        SELECT *
                        FROM paginate
                        RIGHT JOIN (SELECT count(DISTINCT paginate.int_id)::INT FROM paginate) c(item_count) ON true;
                    `
                    .replace("SELECT", `SELECT "${info.fieldName}".id as "int_id",`)
                    .replace("LIMIT 1 OFFSET 0", `LIMIT ${limit} OFFSET ${offset}`);

                const data = await db.any(paginatedSql);
                item_count = data[0]?.item_count || 0;
                return data;
            },
            joinMonsterOptions,
        );

        try {
            context.pagination = {
                page,
                limit,
                page_count: Math.ceil(item_count / limit),
                item_count,
            };

            resolve(dbData || []);
        } catch (e) {
            reject(e);
        }
    });
}