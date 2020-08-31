import {db} from "../../../db/db";
import {createJson} from "../../resolvers";

export default async (_parent, {id, piece_uuids}, _context, _info) => {
    try {
        return await new Promise(async (resolve, _reject) => {
            const json = await createJson(id, piece_uuids)
            resolve(json)

            // Increase download count by 1
            db.none(
                    `
                        UPDATE layouts
                        SET dl_count = dl_count + 1
                        WHERE id = hex_to_int('$1^')
                `,
                [id]
            )
        })
    } catch (e) {
        console.error(e)
        throw new Error(e)
    }
}