import {db} from "../../db/db";

export default async (_parent, _args, _context, _info) => {
    try {
        const categoriesDB = await db.one(`
            SELECT ARRAY(
                           SELECT DISTINCT UNNEST(categories)
                           FROM themes
                       ) as categories
        `)

        return categoriesDB.categories
    } catch (e) {
        console.error(e)
        throw new Error(e)
    }
}