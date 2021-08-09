import {db} from "../../util/db";

export default async (_parent, _args, _context, _info) => {
    const categoriesDB = await db.one(`
        SELECT ARRAY(
                       SELECT DISTINCT UNNEST(categories)
                       FROM themes
                   ) as categories
    `);

    return categoriesDB.categories;
}