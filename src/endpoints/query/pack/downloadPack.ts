const {
    promises: {access},
    constants
} = require('fs')
import AdmZip from 'adm-zip'
import {graphql} from "graphql";
import {errorName} from "../../../util/errorTypes";
import {db} from "../../../db/db";
import {invalidFilenameCharsREGEX, prepareNXTheme, storagePath} from "../../resolvers";

export default async (_parent, {id}, context, info) => {
    try {
        return await new Promise(async (resolve, reject) => {
            // Get the pack details and theme ids
            let pack
            try {
                const {data} = await graphql({
                    schema: info.schema,
                    variableValues: {
                        id
                    },
                    contextValue: context,
                    rootValue: info.rootValue,
                    source: `
									query pack($id: String!) {
										pack(id: $id) {
											id
											details {
												name
											}
											creator {
												display_name
											}
											last_updated
											themes {
												id
												last_updated
												layout {
													last_updated
												}
											}
										}
									}
								`
                })
                if (data?.pack) {
                    pack = data.pack
                } else reject(errorName.PACK_NOT_FOUND)
            } catch (e) {
                console.error(e)
                reject(errorName.PACK_NOT_FOUND)
                return
            }

            try {
                const cacheEntry = await db.oneOrNone(
                    `
								SELECT last_built
								FROM packs_cache
								WHERE id = hex_to_int('$1^')
							`,
                    [pack.id]
                )

                let shouldRebuild = false

                if (cacheEntry) {
                    if (
                        pack.last_updated > cacheEntry.last_built ||
                        pack.themes.some(
                            (t) =>
                                t.last_updated > cacheEntry.last_built ||
                                t.layout?.last_updated > cacheEntry.last_built
                        )
                    ) {
                        shouldRebuild = true
                    } else {
                        try {
                            await access(
                                `${storagePath}/cache/packs/${pack.id}.zip`,
                                constants.R_OK | constants.W_OK
                            )
                        } catch (e) {
                            shouldRebuild = true
                        }
                    }
                } else {
                    shouldRebuild = true
                }

                if (shouldRebuild) {
                    // Create the NXThemes
                    const themePromises = pack.themes.map((t) => prepareNXTheme(t.id, undefined))
                    const themesReturned: Array<any> = await Promise.all(themePromises)

                    // Create zip
                    // Use basic for-loop instead of promises to prevent 'MaxListenersExceededWarning' (I guess):
                    const zip = new AdmZip()
                    for (const i in themesReturned) {
                        try {
                            await zip.addLocalFile(
                                themesReturned[i].path,
                                null,
                                `${themesReturned[i].filename}`
                            )
                        } catch (e) {
                            console.error(e)
                            reject(errorName.PACK_CREATE_FAILED)
                            return
                        }
                    }

                    // Write zip to cache
                    await zip.writeZip(`${storagePath}/cache/packs/${pack.id}.zip`)

                    await db.none(
                        `
                        UPDATE packs
                            SET dl_count = dl_count + 1
                        WHERE  id = hex_to_int('$1^');

                        INSERT INTO packs_cache (id, last_built)
                        VALUES(hex_to_int('$1^'), NOW()) 
                        ON CONFLICT (id) 
                        DO 
                            UPDATE SET 
                                last_built = NOW();
                    `,
                        [pack.id]
                    )
                }

                resolve({
                    filename: (`${pack.details.name} by ${pack.creator.display_name} via Themezer.zip`).replace(invalidFilenameCharsREGEX, '_'),
                    url: `${process.env.API_ENDPOINT}/cdn/cache/packs/${pack.id}.zip`,
                    mimetype: 'application/zip'
                })

                // Increase download count by 1
                await db.none(
                    `
                        UPDATE packs
                            SET dl_count = dl_count + 1
                        WHERE  id = hex_to_int('$1^');
                    `,
                    [pack.id]
                )
            } catch (e) {
                console.error(e)
                reject(errorName.PACK_CREATE_FAILED)
            }
        })
    } catch (e) {
        console.error(e)
        throw new Error(e)
    }
}