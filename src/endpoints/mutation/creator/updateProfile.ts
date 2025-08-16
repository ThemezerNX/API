const {
    promises: {mkdir},
} = require("fs");
const {uuid} = require("uuidv4");
const rimraf = require("rimraf");
import {db, pgp} from "../../../db/db";
import {errorName} from "../../../util/errorTypes";
import {saveFiles, storagePath, updateCreatorCS} from "../../resolvers";
import {JSDOM} from "jsdom";
import DOMPurify from "dompurify";

export default async (
    _parent,
    {
        id,
        custom_username,
        bio,
        profile_color,
        banner_image,
        logo_image,
        clear_banner_image,
        clear_logo_image,
        is_blocked,
    },
    context,
    _info,
) => {
    if (process.env.READ_ONLY === "true") {
        throw new Error(errorName.READ_ONLY);
    }

    await context.authenticate();
    if (context.req.user.id === id || context.req.user.roles?.includes("admin")) {
        return await new Promise(async (resolve, reject) => {
            try {
                // We sanitize the bio DOM contents if it is defined
                if (bio) {
                    const {window} = new JSDOM("");
                    const domPurify = DOMPurify(window);

                    bio = domPurify.sanitize(bio);
                }

                let object: any = {
                    custom_username,
                    bio,
                    profile_color,
                };

                if (context.req.user.roles?.includes("admin") && context.req.user.id !== id) {
                    object.is_blocked = is_blocked;
                }

                const toSavePromises = [];
                const bannerPath = `${storagePath}/creators/${id}/banner`;
                if (!clear_banner_image && !!banner_image) {
                    toSavePromises.push(
                        new Promise<void>(async (resolve, reject) => {
                            try {
                                await mkdir(bannerPath, {recursive: true});
                                rimraf(bannerPath + "/*", async () => {
                                    try {
                                        const files = await Promise.all(
                                            saveFiles([
                                                {
                                                    file: banner_image,
                                                    savename: uuid(),
                                                    path: bannerPath,
                                                },
                                            ]),
                                        );
                                        object.banner_image = files[0];
                                        resolve();
                                    } catch (e) {
                                        reject(e);
                                    }
                                });
                            } catch (e) {
                                console.error(e);
                                reject(e);
                            }
                        }),
                    );
                } else if (clear_banner_image) {
                    object.banner_image = null;
                    rimraf(bannerPath, () => {
                    });
                }

                const logoPath = `${storagePath}/creators/${id}/logo`;
                if (!clear_logo_image && !!logo_image) {
                    toSavePromises.push(
                        new Promise<void>(async (resolve, reject) => {
                            try {
                                await mkdir(logoPath, {recursive: true});
                                rimraf(logoPath + "/*", async () => {
                                    try {
                                        const files = await Promise.all(
                                            saveFiles([
                                                {
                                                    file: logo_image,
                                                    savename: uuid(),
                                                    path: logoPath,
                                                },
                                            ]),
                                        );
                                        object.logo_image = files[0];
                                        resolve();
                                    } catch (e) {
                                        reject(e);
                                    }
                                });
                            } catch (e) {
                                console.error(e);
                                reject(e);
                            }
                        }),
                    );
                } else if (clear_logo_image) {
                    object.logo_image = null;
                    rimraf(logoPath, () => {
                    });
                }

                await Promise.all(toSavePromises);

                const query = () => pgp.helpers.update(object, updateCreatorCS);
                try {
                    await db.none(query() + ` WHERE id = $1`, [id]);
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
    } else {
        throw new Error(errorName.UNAUTHORIZED);
    }
}