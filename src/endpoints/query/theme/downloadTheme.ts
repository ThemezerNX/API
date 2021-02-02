import {getTheme} from "../../resolvers";
import {db} from "../../../db/db";

export default async (_parent, {id, piece_uuids}) => {
    try {
        // Increase download count by 1
        await db.none(
            `
                UPDATE themes
                SET dl_count = dl_count + 1
                WHERE id = hex_to_int('$1^');
            `,
            [id],
        );

        return await getTheme(id.replace(/t/i, ""), piece_uuids);
    } catch (e) {
        console.error(e);
        throw new Error(e);
    }
}