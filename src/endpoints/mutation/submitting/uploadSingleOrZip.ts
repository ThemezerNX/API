import filterAsync from "node-filter-async";
import fs from "fs";
import {errorName} from "../../../util/errorTypes";
import {getDefaultID, parseID} from "@themezernx/layout-id-parser/dist/index";
import {db} from "../../../util/db";
import {themeTargetToFileName, validThemeTarget} from "../../../util/targetParser";
import {encrypt} from "../../../util/crypt";
import {saveFiles} from "../../resolvers";
import rimraf from "rimraf";
import {promisify} from "util";
import tmp from "tmp";
import AdmZip from "adm-zip";
import YAZ0_FILE from "is-yaz0-file";
import ZIP_FILE from "is-zip-file";
import Theme from "../../../filetypes/Theme";

const {promises: {readdir, readFile, access}, constants} = fs;
const isYaz0Promisified = promisify(YAZ0_FILE.isYaz0);
const isZipPromisified = promisify(ZIP_FILE.isZip);

export default async (_parent, {file}, context, _info) => {
    if (await context.authenticate()) {
        if (!context.req.user.is_blocked) {
            return await new Promise((resolve, reject) => {
                tmp.dir({prefix: "theme"}, async (err, path, _cleanupCallback) => {
                    try {
                        if (err) {
                            reject(err);
                            return;
                        }

                        const filePromises = saveFiles([{file, path}]);
                        const files = await Promise.all(filePromises);

                        // Create array of valid NXThemes
                        let NXThemePaths = [];
                        if (await isYaz0Promisified(`${path}/${files[0]}`)) {
                            NXThemePaths.push(`${path}/${files[0]}`);
                        } else if (await isZipPromisified(`${path}/${files[0]}`)) {
                            try {
                                const zip = new AdmZip(`${path}/${files[0]}`);
                                await zip.extractAllTo(`${path}/${files[0]}_extracted`);

                                try {
                                    const filesInZip = await readdir(`${path}/${files[0]}_extracted`);
                                    const NXThemesInZip = await filterAsync(filesInZip, async (file) => {
                                        try {
                                            return await isYaz0Promisified(
                                                `${path}/${files[0]}_extracted/${file}`,
                                            );
                                        } catch (e) {
                                        }
                                    });

                                    NXThemePaths = NXThemesInZip.map((file) => {
                                        return `${path}/${files[0]}_extracted/${file}`;
                                    });
                                } catch (e) {
                                    reject(new Error(errorName.ZIP_READ_ERROR));
                                    rimraf(path, () => {
                                    });
                                }
                            } catch (e) {
                                reject(new Error(errorName.FILE_READ_ERROR));
                                rimraf(path, () => {
                                });
                            }
                        } else {
                            reject(new Error(errorName.INVALID_FILE_TYPE));
                            rimraf(path, () => {
                            });
                            return;
                        }

                        if (NXThemePaths.length > 50) {
                            reject(new Error(errorName.MAX_50_NXTHEMES));
                            return;
                        }

                        // Process all valid NXThemes
                        if (NXThemePaths.length > 0) {
                            const unpackPromises = NXThemePaths.map(
                                (path) => (new Theme()).loadFile(path),
                            );
                            const unpackedThemes = await Promise.all(unpackPromises);

                            const readThemePromises = unpackedThemes.map((thm) => {
                                return new Promise(async (resolve, reject) => {
                                    try {
                                        // Read info.json
                                        const i = await readFile(`${thm.getContentsPath}/info.json`);
                                        const info = JSON.parse(i.toString());

                                        // Read layout.json
                                        let layout = null;
                                        try {
                                            const l = await readFile(`${thm.getContentsPath}/layout.json`);
                                            layout = JSON.parse(l.toString());
                                        } catch (e) {
                                        }

                                        // Check if image in dds or jpg format
                                        let image = false;
                                        try {
                                            await access(
                                                `${thm.getContentsPath}/image.dds`,
                                                constants.R_OK | constants.W_OK,
                                            );
                                            image = true;
                                        } catch (e) {
                                        }
                                        try {
                                            await access(
                                                `${thm.getContentsPath}/image.jpg`,
                                                constants.R_OK | constants.W_OK,
                                            );
                                            image = true;
                                        } catch (e) {
                                        }

                                        // Only proceed if info and at least layout or image is detected
                                        if (info && (layout || image)) {
                                            // If the layout has an ID specified get the uuid
                                            let layoutID = layout?.ID;

                                            if (!layout) {
                                                layoutID = getDefaultID(info.Target);
                                            }

                                            let dbLayout = null;
                                            if (layoutID) {
                                                const {service, id, piece_uuids} = parseID(layoutID);
                                                // Only fetch the layout if it was created by Themezer

                                                if (service === "Themezer") {
                                                    try {
                                                        dbLayout = await db.one(
                                                            `
                                                                SELECT *,
                                                                       (
                                                                           SELECT array_agg(row_to_json(p)) as used_pieces
                                                                           FROM (
                                                                                    SELECT unnest(pieces) ->> 'name'                       as name,
                                                                                           json_array_elements(unnest(pieces) -> 'values') as value
                                                                                    FROM layouts
                                                                                    WHERE id = hex_to_int('$1^')
                                                                                ) as p
                                                                           WHERE value ->> 'uuid' = ANY ($2::text[])
                                                                       ),
                                                                       to_hex(id)                                              as id,
                                                                       CASE WHEN commonlayout IS NULL THEN false ELSE true END AS has_commonlayout
                                                                FROM layouts
                                                                WHERE id = hex_to_int('$1^')
                                                            `,
                                                            [id, piece_uuids],
                                                        );
                                                    } catch (e) {
                                                        console.error(e);
                                                        reject(new Error(errorName.INVALID_ID));
                                                        return;
                                                    }
                                                }
                                            }

                                            let target = null;
                                            if (validThemeTarget(info.Target)) {
                                                target = themeTargetToFileName(info.Target);
                                            } else {
                                                reject(new Error(errorName.INVALID_TARGET_NAME));
                                                return;
                                            }

                                            // Return detected used_pieces separately
                                            let used_pieces = [];
                                            if (dbLayout) {
                                                used_pieces = dbLayout.used_pieces;
                                                delete dbLayout.used_pieces;
                                                if (layout && target !== dbLayout.target) {
                                                    reject(new Error(errorName.TARGETS_DONT_MATCH));
                                                    return;
                                                }
                                            }

                                            resolve({
                                                info: info,
                                                tmp: encrypt(thm.getContentsPath),
                                                layout: dbLayout,
                                                used_pieces: used_pieces,
                                                target: target,
                                            });
                                        } else {
                                            reject(new Error(errorName.INVALID_NXTHEME_CONTENTS));
                                            rimraf(path, () => {
                                            });
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        reject(new Error(errorName.INVALID_NXTHEME_CONTENTS));
                                        rimraf(path, () => {
                                        });
                                    }
                                });
                            });

                            // Execute all the NXTheme read promises
                            const detectedThemes = await Promise.all(readThemePromises);

                            if (detectedThemes?.length > 0) {
                                resolve(detectedThemes);
                            } else if (detectedThemes?.length === 0) {
                                reject(new Error(errorName.NO_VALID_NXTHEMES));
                                rimraf(path, () => {
                                });
                            } else {
                                reject(new Error(errorName.FILE_READ_ERROR));
                                rimraf(path, () => {
                                });
                            }
                        } else {
                            reject(new Error(errorName.NO_NXTHEMES_IN_ZIP));
                            rimraf(path, () => {
                            });
                        }
                    } catch (e) {
                        console.error(e);
                        reject(e);
                        return;
                    }
                });
            });
        } else {
            throw new Error(errorName.SUBMITTING_BLOCKED);
        }
    } else {
        throw new Error(errorName.UNAUTHORIZED);
    }
}