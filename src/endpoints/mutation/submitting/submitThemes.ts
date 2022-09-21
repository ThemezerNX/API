import fs from "fs";
import {promisify} from "util";
import moveFile from "mvdir";
import {decrypt} from "../../../util/crypt";
import {errorName} from "../../../util/errorTypes";
import {db, pgp} from "../../../db/db";
import {fileNameToWebName, validFileName} from "../../../util/targetParser";
import {packMessage, themeMessage} from "../../../util/webhookMessages";
import {avatar, packsCS, saveFiles, storagePath, themesCS, urlNameREGEX} from "../../resolvers";
import {allowedFilesInNXTheme} from "../../../filetypes/Theme";
import exifr from "exifr";

const webhook = require("webhook-discord");
const rimraf = require("rimraf");
const JPEG_FILE = require("is-jpeg-file");
const sizeOf = require("image-size");
const sharp = require("sharp");

const {
    lstat,
    promises: {readdir},
} = fs;
const isJpegPromisified = promisify(JPEG_FILE.isJpeg);
const Hook = new webhook.Webhook(process.env.WEBHOOK_URL);

export default async (_parent, {files, themes, details, type}, context, _info) => {
    let themePaths = [];
    try {
        if (await context.authenticate()) {
            if (!context.req.user.is_blocked) {
                return await new Promise(async (resolve, reject) => {
                    let insertedPack = null;

                    // Create array of screenshots to save
                    const toSave = files.map((f, i) => {
                        return new Promise((resolve, reject) => {
                            const path = decrypt(themes[i].tmp);
                            lstat(path, (err) => {
                                if (err) {
                                    reject(new Error(errorName.INVALID_TMP));
                                    return;
                                }

                                resolve({
                                    file: f,
                                    savename: "original",
                                    path: path,
                                });
                            });
                        });
                    });
                    const resolvedDecryptions = await Promise.all(toSave);

                    // Save the screenshots
                    const filePromises = saveFiles(resolvedDecryptions);
                    const savedFiles = await Promise.all(filePromises);

                    // If every theme has a screenshot
                    if (savedFiles.length === themes.length) {
                        const promises = savedFiles.map((file, i) => {
                            return new Promise(async (resolve) => {
                                const path = decrypt(themes[i].tmp);
                                // If a valid jpeg
                                const imagePath = `${path}/${file}`;
                                const isJpeg = await isJpegPromisified(imagePath);
                                const exif = await exifr.parse(imagePath);
                                const hasSwitchMetadata = exif?.Make?.includes("Nintendo");
                                if (isJpeg) {
                                    if (hasSwitchMetadata) {
                                        sizeOf(imagePath, function (err, dimensions) {
                                            if (err) reject(err);
                                            else if (dimensions.width === 1280 && dimensions.height === 720) {
                                                resolve(path);
                                            } else {
                                                reject(new Error(errorName.INVALID_SCREENSHOT_DIMENSIONS));
                                            }
                                        });
                                    } else {
                                        reject(new Error(errorName.NOT_A_SCREENSHOT))
                                    }
                                }
                            });
                        });
                        themePaths = await Promise.all(promises);

                        // If all jpegs are valid
                        if (themePaths.length === savedFiles.length) {
                            // Create thumb.jpg
                            const thumbPromises = themePaths.map((path) =>
                                sharp(`${path}/original.jpg`)
                                    .resize(320, 180)
                                    .toFile(`${path}/thumb.jpg`),
                            );
                            await Promise.all(thumbPromises);

                            // Insert pack into DB if user wants to and can submit as pack
                            if (type === "pack" && savedFiles.length > 1) {
                                const packData = {
                                    last_updated: new Date(),
                                    creator_id: context.req.user.id,
                                    details: {
                                        name: details.name.trim(),
                                        description: details.description.trim(),
                                        color: details.color,
                                    },
                                };

                                const query = () => pgp.helpers.insert([packData], packsCS);
                                try {
                                    insertedPack = await db.one(
                                        query() +
                                        ` RETURNING id, to_hex(id) as hex_id, details, last_updated, creator_id`,
                                    );
                                } catch (e) {
                                    console.error(e);
                                    reject(new Error(errorName.DB_SAVE_ERROR));
                                    return;
                                }
                            }

                            // Save NXTheme contents
                            const themeDataPromises = themePaths.map((path, i) => {
                                return new Promise(async (resolve, reject) => {
                                    let bgType = null;

                                    try {
                                        // Read dir contents
                                        const filesInFolder = await readdir(path);

                                        if (filesInFolder.includes("image.jpg")) {
                                            bgType = "jpg";
                                        } else if (filesInFolder.includes("image.dds")) {
                                            bgType = "dds";
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        return;
                                    }

                                    // TODO: Reject if any of the values is too long, match client limits

                                    // Reject if more than 10 categories
                                    if (!themes[i].categories || themes[i].categories.length < 1 || themes[i].categories.length > 10) {
                                        reject(new Error(errorName.INVALID_CATEGORY_AMOUNT));
                                        return;
                                    }

                                    // Process each category
                                    const categories = themes[i].categories.map((c) =>
                                        c.trim().replace(/(^\w)|(\s\w)/g, (match) => match.toUpperCase()),
                                    );

                                    // Add NSFW as category
                                    if (themes[i].nsfw) {
                                        categories.push("NSFW");
                                    }

                                    if (!validFileName(themes[i].target)) {
                                        reject(new Error(errorName.INVALID_TARGET_NAME));
                                        return;
                                    }

                                    // Get uuids from extra dropdown entries
                                    let splitID = null;
                                    let piece_uuids = null;
                                    if (themes[i].layout_id) {
                                        splitID = themes[i].layout_id.split("|");
                                        if (splitID.length > 1) {
                                            // Has piece uuids
                                            piece_uuids = splitID[1].split(",");
                                        }
                                    }

                                    resolve({
                                        layout_id: splitID ? Number(`0x${splitID[0]}`) : null,
                                        piece_uuids:
                                            themes[i].used_pieces?.length > 0
                                                ? themes[i].used_pieces.map((p) => p.value.uuid)
                                                : piece_uuids,
                                        target: themes[i].target,
                                        last_updated: new Date(),
                                        categories: categories.sort(),
                                        pack_id: insertedPack?.id,
                                        creator_id: context.req.user.id,
                                        details: {
                                            name: themes[i].info.ThemeName.trim(),
                                            description: themes[i].description
                                                ? themes[i].description.trim()
                                                : null,
                                            color: themes[i].color,
                                        },
                                        bg_type: bgType,
                                    });
                                });
                            });
                            const themeDatas = await Promise.all(themeDataPromises);

                            // Insert themes into DB
                            const query = () => pgp.helpers.insert(themeDatas, themesCS);
                            try {
                                const insertedThemes = await db.many(
                                    query() +
                                    ` RETURNING id, to_hex(id) as hex_id, details, last_updated, creator_id, target, categories`,
                                );

                                const themeMovePromises = themePaths.map((path, i) => {
                                    return new Promise(async (resolve, reject) => {
                                        try {
                                            // Read dir contents
                                            const filesInFolder = await readdir(path);
                                            // Filter allowed files, 'screenshot.jpg', not 'info.json', and not 'layout.json' if the layout is in the DB
                                            const filteredFilesInFolder = filesInFolder.filter(
                                                (f) =>
                                                    (allowedFilesInNXTheme.includes(f) &&
                                                        f !== "info.json" &&
                                                        !(f === "layout.json" && themes[i].layout_id)) ||
                                                    f === "original.jpg" ||
                                                    f === "thumb.jpg",
                                            );

                                            // Move NXTheme contents to cdn
                                            const moveAllPromises = filteredFilesInFolder.map((f) => {
                                                if (f === "original.jpg" || f === "thumb.jpg") {
                                                    return moveFile(
                                                        `${path}/${f}`,
                                                        `${storagePath}/themes/${insertedThemes[i].hex_id}/images/${f}`,
                                                    );
                                                } else {
                                                    return moveFile(
                                                        `${path}/${f}`,
                                                        `${storagePath}/themes/${insertedThemes[i].hex_id}/${f}`,
                                                    );
                                                }
                                            });

                                            await Promise.all(moveAllPromises);

                                            resolve(true);
                                        } catch (e) {
                                            console.error(e);
                                            reject(new Error(errorName.FILE_SAVE_ERROR));
                                            return;
                                        }
                                    });
                                });

                                await Promise.all(themeMovePromises);

                                resolve(true);

                                setTimeout(() => {
                                    // Wait 5 seconds because the image has issues loading if it's been created very recently
                                    if (type === "pack") {
                                        const newPackMessage = packMessage();

                                        newPackMessage
                                            .setTitle(insertedPack.details.name)
                                            .setAuthor(
                                                context.req.user.display_name,
                                                avatar(context.req.user.id, context.req.user.discord_user) +
                                                "?size=64",
                                                `${process.env.WEBSITE_ENDPOINT}/creators/${context.req.user.id}`,
                                            )
                                            .addField(
                                                "Install ID:",
                                                `P${insertedPack.hex_id.toUpperCase()}`,
                                            )
                                            .addField(
                                                "Themes in this pack:",
                                                themeDatas.map((t: any) => t.details.name).join("\n"),
                                            )
                                            .setURL(
                                                `${
                                                    process.env.WEBSITE_ENDPOINT
                                                }/packs/${insertedPack.details.name.replace(urlNameREGEX, "-")}-${
                                                    insertedPack.hex_id
                                                }`,
                                            );

                                        if (!themeDatas.some((t: any) => t.categories?.includes("NSFW"))) {
                                            newPackMessage
                                                .setTitle(insertedPack.details.name)
                                                .setThumbnail(
                                                    `${process.env.API_ENDPOINT}/cdn/themes/${
                                                        (insertedThemes[0] as any).hex_id
                                                    }/images/original.jpg`,
                                                );
                                        } else {
                                            newPackMessage.setTitle(`${insertedPack.details.name} (NSFW!)`);
                                        }

                                        if (insertedPack.details.description) {
                                            newPackMessage.setDescription(insertedPack.details.description);
                                        }

                                        Hook.send(newPackMessage);
                                    } else {
                                        insertedThemes.forEach((t: any) => {
                                            const newThemeMessage = themeMessage();
                                            newThemeMessage
                                                .setAuthor(
                                                    context.req.user.display_name,
                                                    avatar(context.req.user.id, context.req.user.discord_user) +
                                                    "?size=64",
                                                    `${process.env.WEBSITE_ENDPOINT}/creators/${context.req.user.id}`,
                                                )
                                                .setURL(
                                                    `${process.env.WEBSITE_ENDPOINT}/themes/${fileNameToWebName(
                                                        t.target,
                                                    )}/${t.details.name.replace(urlNameREGEX, "-")}-${t.hex_id}`,
                                                )
                                                .addField(
                                                    "Install ID:",
                                                    `T${t.hex_id.toUpperCase()}`,
                                                );

                                            if (!t.categories?.includes("NSFW")) {
                                                newThemeMessage
                                                    .setTitle(t.details.name)
                                                    .setThumbnail(
                                                        `${process.env.API_ENDPOINT}/cdn/themes/${t.hex_id}/images/original.jpg`,
                                                    );
                                            } else {
                                                newThemeMessage.setTitle(`${t.details.name} (NSFW!)`);
                                            }

                                            if (t.details.description) {
                                                newThemeMessage.setDescription(t.details.description);
                                            }

                                            Hook.send(newThemeMessage);
                                        });
                                    }

                                    for (const i in themePaths) {
                                        rimraf(themePaths[i], () => {
                                        });
                                    }
                                }, 5000);
                            } catch (e) {
                                console.error(e);
                                reject(new Error(errorName.DB_SAVE_ERROR));
                            }
                        } else {
                            reject(new Error(errorName.INVALID_FILE_TYPE));
                        }
                    } else {
                        reject(new Error(errorName.FILE_SAVE_ERROR));
                    }
                });
            } else {
                throw new Error(errorName.SUBMITTING_BLOCKED);
            }
        } else {
            throw new Error(errorName.UNAUTHORIZED);
        }
    } catch (e) {
        for (const i in themePaths) {
            rimraf(themePaths[i], () => {
            });
        }
        throw e;
    }
}
