import {db} from "../../../util/db";
import Layout from "../../../filetypes/Layout";

export default async (_parent, {id, piece_uuids}, _context, _info) => {
    const layout = new Layout();
    await layout.loadId(id, piece_uuids);

    // Increase download count by 1
    await db.none(
        `
            UPDATE layouts
            SET dl_count = dl_count + 1
            WHERE id = hex_to_int('$1^')
        `,
        [id],
    );

    return layout.toJSON();
}