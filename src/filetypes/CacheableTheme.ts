import {db} from "../db/db";
import {errorName} from "../util/errorTypes";
import Theme from "./Theme";
import fs from "fs";
import {fileNameToThemeTarget} from "../util/targetParser";
import Layout from "./Layout";
import {storagePath} from "../endpoints/resolvers";

const link = require('fs-symlink');
const moveFile = require('mvdir');
const tmp = require('tmp');
const defaultThemes = ['1a', '19', '18', '17', '16', '15', '14'];

const {
    promises: {access, readdir},
    constants,
} = fs;

export default class CacheableTheme extends Theme {
    private cachedName;
    private filename;
    private lastBuilt;
    private lastUpdated;
    private layoutLastUpdated;

    constructor(...args) {
        super(...args);
    }

    loadId = (hexId, pieceUUIDs?) => {
        return new Promise<any>(async (resolve, reject) => {
            try {
                // Get the theme details
                const {
                    theme_id,
                    layout_id,
                    has_common,
                    name,
                    target,
                    creator_name,
                    theme_piece_uuids,
                    last_updated,
                    layout_last_updated,
                } = await db.one(
                    `
                        SELECT to_hex(theme.id)                as theme_id,
                               to_hex(theme.layout_id)         as layout_id,
                               layout.commonlayout IS NOT NULL as has_common,
                               theme.details ->> 'name'        as name,
                               theme.target,
                               piece_uuids                     as theme_piece_uuids,
                               theme.last_updated,
                               layout.last_updated             as layout_last_updated,
                               (
                                   SELECT coalesce(custom_username, discord_user ->> 'username')
                                   FROM creators
                                   WHERE id = theme.creator_id
                                   LIMIT 1
                               )                               as creator_name
                        FROM themes theme
                                 LEFT JOIN layouts layout
                                           ON theme.layout_id = layout.id
                        WHERE theme.id = hex_to_int('$1^')
                        LIMIT 1
                    `,
                    [hexId],
                );

                // If custom uuids not defined, use default uuids
                this.pieceUUIDs = pieceUUIDs || theme_piece_uuids || [];

                this.name = name;
                this.id = theme_id;
                this.target = target;
                this.author = creator_name;
                this.lastUpdated = last_updated;
                this.layoutLastUpdated = layout_last_updated;
                if (!!layout_id && !defaultThemes.includes(layout_id.toLowerCase())) {
                    this.layout = new Layout();
                    await this.layout.loadId(layout_id, this.pieceUUIDs);

                    if (has_common && this.target == 'ResidentMenu') {
                        this.commonLayout = new Layout(true);
                        await this.commonLayout.loadId(layout_id);
                    }
                }
                try {
                    await this.updateCache();
                } catch (e) {
                    reject(e);
                    return;
                }

                resolve({
                    id: this.id,
                    name: this.name,
                    filename: this.filename,
                    lastBuilt: this.lastBuilt,
                    lastUpdated: this.lastUpdated,
                    layoutLastUpdated: this.layoutLastUpdated,
                    target: fileNameToThemeTarget(this.target),
                    preview: `${process.env.API_ENDPOINT}/cdn/themes/${this.id}/images/original.jpg`,
                    thumbnail: `${process.env.API_ENDPOINT}/cdn/themes/${this.id}/images/thumb.jpg`,
                    localfilename: `${this.id +
                    (this.pieceUUIDs?.length > 0 ? `_${this.pieceUUIDs.join(',')}` : '')}.nxtheme`,
                    path: `${storagePath}/cache/themes/${this.id +
                    (this.pieceUUIDs?.length > 0 ? `_${this.pieceUUIDs.join(',')}` : '')}.nxtheme`,
                    mimetype: 'application/nxtheme',
                });
            } catch (e) {
                console.error(e);
                reject(errorName.THEME_NOT_FOUND);
            }
        });
    };

    updateCache = async () => {
        return new Promise<any>(async (resolve, reject) => {
            tmp.dir({unsafeCleanup: true}, async (err, path, cleanupCallback) => {
                if (err) {
                    reject(err);
                    return;
                }

                try {
                    const cacheEntry = await db.oneOrNone(
                        `
                            SELECT filename, name, last_built
                            FROM themes_cache
                            WHERE id = hex_to_int('$1^')
                              AND piece_uuids = $2::uuid[]
                        `,
                        [this.id, this.pieceUUIDs],
                    );

                    let fileExists = true;
                    if (cacheEntry) {
                        this.cachedName = cacheEntry.name;
                        this.filename = cacheEntry.filename;
                        this.lastBuilt = cacheEntry.last_built;

                        try {
                            await access(
                                `${storagePath}/cache/themes/${this.id +
                                (this.pieceUUIDs?.length > 0 ? `_${this.pieceUUIDs.join(',')}` : '')}.nxtheme`,
                                constants.R_OK | constants.W_OK,
                            );
                        } catch (e) {
                            fileExists = false;
                        }
                    }

                    if (
                        !cacheEntry ||
                        !fileExists ||
                        this.lastUpdated > this.lastBuilt ||
                        this.layoutLastUpdated > this.lastBuilt
                    ) {
                        // Rebuild

                        // Symlink all other allowedFilesInNXTheme
                        const filesInFolder = await readdir(`${storagePath}/themes/${this.id}`);
                        const linkAllPromises = filesInFolder.map((file) =>
                            link(`${storagePath}/themes/${this.id}/${file}`, `${path}/${file}`),
                        );
                        await Promise.all(linkAllPromises);

                        await this.loadFolder(path, false);

                        const savedTheme = await this.saveTo(path);
                        this.filename = savedTheme.filename || cacheEntry.filename;
                        this.name = this.name || cacheEntry.name;

                        await moveFile(
                            savedTheme.path,
                            `${storagePath}/cache/themes/${this.id +
                            (this.pieceUUIDs.length > 0 ? `_${this.pieceUUIDs.join(',')}` : '')}.nxtheme`,
                        );

                        await db.none(
                            `
                                INSERT INTO themes_cache (id, piece_uuids, filename, name, last_built)
                                VALUES (hex_to_int('$1^'), $2::uuid[], $3, $4, NOW())
                                ON CONFLICT (id, piece_uuids)
                                    DO UPDATE SET filename   = $3,
                                                  name       = $4,
                                                  last_built = NOW();
                            `,
                            [this.id, this.pieceUUIDs, this.filename, this.name],
                        );
                    }

                    resolve();
                    cleanupCallback();
                } catch (e) {
                    console.error(e);
                    reject(errorName.NXTHEME_CREATE_FAILED);
                }
            });
        });
    };

}