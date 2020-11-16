const {
    promises: {mkdir}
} = require('fs')
import {uuid} from "uuidv4";
import rimraf from 'rimraf'
import {db, pgp} from "../../../db/db";
import {errorName} from "../../../util/errorTypes";
import {saveFiles, storagePath, updateCreatorCS} from "../../resolvers";

export default async (
    _parent,
    {id, custom_username, bio, profile_color, banner_image, logo_image, clear_banner_image, clear_logo_image, is_blocked},
    context,
    _info
) => {
    try {
        await context.authenticate()
        if (context.req.user.id === id || context.req.user.roles?.includes('admin')) {
            return await new Promise(async (resolve, reject) => {
                try {
                    let object: any = {
                        custom_username: custom_username,
                        bio: bio?.replace(/< *script *>.*?< *\/ *script *>/gim, ''), // Remove script tags for cross-site scripting
                        profile_color: profile_color
                    }

                    if (context.req.user.roles?.includes('admin') && context.req.user.id !== id) {
                        object.is_blocked = is_blocked
                    }

                    const toSavePromises = []
                    const bannerPath = `${storagePath}/creators/${id}/banner`
                    if (!clear_banner_image && !!banner_image) {
                        toSavePromises.push(
                            new Promise(async (resolve, reject) => {
                                try {
                                    await mkdir(bannerPath, {recursive: true})
                                    rimraf(bannerPath + '/*', async () => {
                                        try {
                                            const files = await Promise.all(
                                                saveFiles([
                                                    {
                                                        file: banner_image,
                                                        savename: uuid(),
                                                        path: bannerPath
                                                    }
                                                ])
                                            )
                                            object.banner_image = files[0]
                                            resolve()
                                        } catch (e) {
                                            reject(e)
                                        }
                                    })
                                } catch (e) {
                                    console.error(e)
                                    reject(e)
                                }
                            })
                        )
                    } else if (clear_banner_image) {
                        object.banner_image = null
                        rimraf(bannerPath, () => {
                        })
                    }

                    const logoPath = `${storagePath}/creators/${id}/logo`
                    if (!clear_logo_image && !!logo_image) {
                        toSavePromises.push(
                            new Promise(async (resolve, reject) => {
                                try {
                                    await mkdir(logoPath, {recursive: true})
                                    rimraf(logoPath + '/*', async () => {
                                        try {
                                            const files = await Promise.all(
                                                saveFiles([
                                                    {
                                                        file: logo_image,
                                                        savename: uuid(),
                                                        path: logoPath
                                                    }
                                                ])
                                            )
                                            object.logo_image = files[0]
                                            resolve()
                                        } catch (e) {
                                            reject(e)
                                        }
                                    })
                                } catch (e) {
                                    console.error(e)
                                    reject(e)
                                }
                            })
                        )
                    } else if (clear_logo_image) {
                        object.logo_image = null
                        rimraf(logoPath, () => {
                        })
                    }

                    await Promise.all(toSavePromises)

                    const query = () => pgp.helpers.update(object, updateCreatorCS)
                    try {
                        await db.none(query() + ` WHERE id = $1`, [id])
                        resolve(true)
                    } catch (e) {
                        console.error(e)
                        reject(errorName.DB_SAVE_ERROR)
                        return
                    }
                } catch (e) {
                    console.error(e)
                    reject(errorName.UNKNOWN)
                }
            })
        } else {
            return new Error(errorName.UNAUTHORIZED)
        }
    } catch (e) {
        console.error(e)
        throw new Error(e)
    }
}