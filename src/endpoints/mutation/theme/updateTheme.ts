import {promisify} from "util";
import tmp from "tmp";
import sharp from "sharp";
import JPEG_FILE from "is-jpeg-file";
import {db, pgp} from "../../../util/db";
import {errorName} from "../../../util/errorTypes";
import {saveFiles, storagePath} from "../../resolvers";
import moveFile from "mvdir";

const isJpegPromisified = promisify(JPEG_FILE.isJpeg);

const updateThemeCS = new pgp.helpers.ColumnSet(
    [
        {name: "details", cast: "json"},
        {name: "categories", cast: "varchar[]"},
        {name: "last_updated", cast: "timestamp without time zone"},
        {name: "piece_uuids", cast: "uuid[]"},
        {name: "layout_id", cast: "int"},
        {name: "pack_id", cast: "int"},
    ],
    {
        table: "themes",
    },
);

export default async (
    _parent,
    {id, file, name, layout_id, pack_id, used_pieces, description, categories, nsfw},
    context,
    _info,
) => {
    await context.authenticate();

    let mayModerate = false;
    if (context.req.user.roles?.includes("admin")) {
        mayModerate = true;
    } else {
        const theme = await db.oneOrNone(`
            SELECT id
            FROM themes
            WHERE creator_id = $1
              AND id = hex_to_int(\'$2^\')
        `, [context.req.user.id, id]);
        if (theme) mayModerate = true;
    }

    if (mayModerate) {
        return await new Promise(async (resolve, reject) => {
            tmp.dir({prefix: "theme"}, async (err, path, _cleanupCallback) => {
                try {
                    if (file) {
                        // Save the screenshot
                        const filePromises = saveFiles([{
                            file: file,
                            savename: "original",
                            path,
                        }]);
                        const savedFiles = await Promise.all(filePromises);

                        if (!(await isJpegPromisified(`${path}/${savedFiles[0]}`))) {
                            reject(new Error(errorName.INVALID_FILE_TYPE));
                        }

                        // Create thumb.jpg
                        await sharp(`${path}/${savedFiles[0]}`)
                            .resize(320, 180)
                            .toFile(`${path}/thumb.jpg`);
                        // Move to storage
                        await moveFile(
                            `${path}/${savedFiles[0]}`,
                            `${storagePath}/themes/${id}/images/${savedFiles[0]}`,
                        );
                        await moveFile(
                            `${path}/thumb.jpg`,
                            `${storagePath}/themes/${id}/images/thumb.jpg`,
                        );
                    }

                    // Reject if invalid category amount
                    if (!categories || categories.length < 1 || categories.length > 10) {
                        reject(new Error(errorName.INVALID_CATEGORY_AMOUNT));
                        return;
                    }

                    // Process each category
                    categories = categories.map((c) =>
                        c.trim().replace(/(^\w)|(\s\w)/g, (match) => match.toUpperCase()),
                    );

                    // Add NSFW as category
                    if (nsfw) {
                        categories.push("NSFW");
                    }

                    // Get uuids from extra dropdown entries
                    let splitID = null;
                    let piece_uuids = null;
                    if (layout_id) {
                        splitID = layout_id.split("|");
                        if (splitID.length > 1) {
                            // Has piece uuids
                            piece_uuids = splitID[1].split(",");
                        }
                    }

                    const updatedTheme = {
                        details: {
                            name,
                            description,
                        },
                        layout_id: splitID ? Number(`0x${splitID[0]}`) : null,
                        pack_id: pack_id ? Number(`0x${pack_id}`) : null,
                        piece_uuids: used_pieces?.length > 0
                            ? used_pieces.map((p) => p.value.uuid)
                            : piece_uuids,
                        categories,
                        last_updated: new Date(),
                    };

                    const query = () => pgp.helpers.update(updatedTheme, updateThemeCS);

                    try {
                        await db.none(query() + ` WHERE id = hex_to_int('$1^')`, [id]);
                        resolve(true);
                    } catch (e) {
                        console.error(e);
                        reject(new Error(errorName.DB_SAVE_ERROR));
                        return;
                    }
                } catch (e) {
                    console.error(e);
                    reject(new Error(errorName.UNKNOWN));
                }
            });
        });
    } else {
        throw new Error(errorName.UNAUTHORIZED);
    }
}