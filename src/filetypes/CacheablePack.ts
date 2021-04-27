import Pack from "./Pack";
import {db} from "../db/db";
import {errorName} from "../util/errorTypes";
import CacheableTheme from "./CacheableTheme";
import {invalidFilenameCharsREGEX, storagePath} from "../endpoints/resolvers";
import fs from "fs";

import AdmZip from "adm-zip";

const tmp = require("tmp");
const {
    promises: {access},
    constants,
} = fs;


export default class CacheablePack extends Pack {
    private cachedName;
    private filename;
    private lastBuilt;
    private lastUpdated;
    private layoutLastUpdated;

    constructor() {
        super();
    }

    loadId = async (hexId) => {
        return new Promise(async (resolve, reject) => {
            // Get the pack details and theme ids
            try {
                const pack = await db.many(
                    `
                        SELECT to_hex("themes".id)      AS "theme_id",
                               "pack".details -> 'name' as pack_name,
                               (
                                   SELECT coalesce(custom_username, discord_user ->> 'username')
                                   FROM creators
                                   WHERE id = "pack".creator_id
                                   LIMIT 1
                               )                        as creator_name
                        FROM packs "pack"
                                 LEFT JOIN packs "details" ON "pack".id = "details".id
                                 LEFT JOIN themes ON "pack".id = "themes".pack_id
                        WHERE "pack".id = hex_to_int('$1^')
                        ORDER BY order_by_array(Array ['ResidentMenu', 'Entrance', 'Flaunch', 'Set', 'Psl', 'MyPage',
                                                    'Notification'], "themes".target),
                                 "themes".details ->> 'name' COLLATE "en-US-x-icu"
                    `,
                    [hexId],
                );
                this.id = hexId;
                this.name = pack[0].pack_name;
                this.author = pack[0].creator_name;

                const themePromises = pack.map((pack) => {
                    const theme = new CacheableTheme();
                    return theme.loadId(pack.theme_id);
                });
                this.themes = await Promise.all(themePromises);
                try {
                    await this.updateCache();
                } catch (e) {
                    reject(e);
                    return;
                }

                resolve({
                    filename: (`${this.name} by ${this.author} via Themezer.zip`).replace(
                        invalidFilenameCharsREGEX,
                        "_"),
                    url: `${process.env.API_ENDPOINT}/cdn/cache/packs/${this.id}.zip`,
                    mimetype: "application/zip",
                });

            } catch (e) {
                console.error(e);
                reject(new Error(errorName.PACK_NOT_FOUND));
                return;
            }
        });
    };

    updateCache = async () => {
        return new Promise((resolve, reject) => {
            tmp.dir({unsafeCleanup: true}, async (err, _path, _cleanupCallback) => {
                if (err) {
                    console.error(err);
                    reject(new Error(errorName.FILE_SAVE_ERROR));
                    return;
                }

                try {
                    const cacheEntry = await db.oneOrNone(
                        `
                            SELECT last_built
                            FROM packs_cache
                            WHERE id = hex_to_int('$1^')
                        `,
                        [this.id],
                    );

                    let fileExists = true;
                    if (cacheEntry) {
                        this.cachedName = cacheEntry.name;
                        this.filename = cacheEntry.filename;
                        this.lastBuilt = cacheEntry.last_built;
                        if (
                            this.lastBuilt > this.lastBuilt ||
                            this.themes.some(
                                (t) =>
                                    t.lastUpdated > this.lastBuilt ||
                                    t.layoutLastUpdated > this.lastBuilt,
                            )
                        ) {
                            fileExists = false;
                        } else {
                            try {
                                await access(
                                    `${storagePath}/cache/packs/${this.id}.zip`,
                                    constants.R_OK | constants.W_OK,
                                );
                            } catch (e) {
                                fileExists = false;
                            }
                        }
                    } else {
                        fileExists = false;
                    }

                    if (!fileExists) {
                        // Create zip
                        // Use basic for-loop instead of promises to prevent 'MaxListenersExceededWarning' (I guess):
                        const zip = new AdmZip();
                        for (const t of this.themes) {
                            try {
                                await zip.addLocalFile(
                                    t.path,
                                    null,
                                    `${t.filename}`,
                                );
                            } catch (e) {
                                console.error(e);
                                reject(new Error(errorName.PACK_CREATE_FAILED));
                                return;
                            }
                        }

                        // Write zip to cache
                        await zip.writeZip(`${storagePath}/cache/packs/${this.id}.zip`);

                        await db.none(
                            `
                                INSERT INTO packs_cache (id, last_built)
                                VALUES (hex_to_int('$1^'), NOW())
                                ON CONFLICT (id)
                                    DO UPDATE SET last_built = NOW();
                            `,
                            [this.id],
                        );
                    }
                    resolve(true);
                } catch (e) {
                    console.error(e);
                    reject(new Error(errorName.PACK_CREATE_FAILED));
                }
            });
        });
    };

}