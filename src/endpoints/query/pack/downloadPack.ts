import CacheablePack from "../../../filetypes/CacheablePack";
import {db} from "../../../db/db";

export default async (_parent, {id}, _context, _info) => {
    // Get the pack details and theme ids
    // Increase download count by 1
    await db.none(
        `
            UPDATE packs
            SET dl_count = dl_count + 1
            WHERE id = hex_to_int('$1^');

            UPDATE themes
            SET dl_count = dl_count + 1
            WHERE pack_id = hex_to_int('$1^');
        `,
        [id, id],
    );
    const pack = new CacheablePack();
    return await pack.loadId(id);
}