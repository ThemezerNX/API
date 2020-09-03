import downloadPack from "./query/pack/downloadPack";
import {db, pgp} from '../db/db'
import {fileNameToThemeTarget} from '../util/targetParser'
import graphqlFields from 'graphql-fields'
import MiniSearch from 'minisearch'
import {errorName} from '../util/errorTypes'
import {stringifyThemeID} from '@themezernx/layout-id-parser'
import GraphQLJSON from 'graphql-type-json'
import {PythonShell} from 'python-shell'

import me from './query/me'
import creator from './query/creator'
import categories from "./query/categories";
import layout from "./query/layout/layout";
import randomLayoutIDs from "./query/layout/randomLayoutIDs";
import theme from "./query/theme/theme";
import randomThemeIDs from "./query/theme/randomThemeIDs";
import pack from "./query/pack/pack";
import randomPackIDs from "./query/pack/randomPackIDs";
import list from "./query/list";
import nxinstaller from "./query/nxinstaller";
import downloadLayout from "./query/layout/downloadLayout";
import downloadCommonLayout from "./query/layout/downloadCommonLayout";
import createOverlay from "./query/createOverlay/createOverlay";
import createOverlayNXThemes from "./query/createOverlay/createOverlayNXThemes";
import deleteTheme from "./mutation/theme/deleteTheme";
import updateAuth from "./mutation/creator/updateAuth";
import uploadSingleOrZip from "./mutation/submitting/uploadSingleOrZip";
import submitThemes from "./mutation/submitting/submitThemes";
import updateProfile from "./mutation/creator/updateProfile";
import setLike from "./mutation/setLike";
import restoreAccount from "./mutation/creator/restoreAccount";
import reportURL from "./mutation/reportURL";
import deletePack from "./mutation/pack/deletePack";
import fs from 'fs'
import {patch} from '@themezernx/json-merger'
import updatePack from "./mutation/pack/updatePack";
import updateTheme from "./mutation/theme/updateTheme";
import downloadTheme from "./query/theme/downloadTheme";

const link = require('fs-symlink')
const {
    createWriteStream,
    unlink,
    promises: {access, readdir, readFile, writeFile},
    constants
} = fs
const moveFile = require('move-file')
const tmp = require('tmp')
const rimraf = require('rimraf')

export const joinMonsterOptions: any = {dialect: 'pg'}
export const sarcToolPath = `${__dirname}/../../../SARC-Tool`
export const storagePath = `${__dirname}/../../../cdn`
export const urlNameREGEX = /[^a-zA-Z0-9_.]+/gm
// const noSpecialCharsREGEX = /[^a-z\d\-]+/gi
export const themeHexREGEX = /^t[0-9a-f]+$/
export const packHexREGEX = /^p[0-9a-f]+$/
export const invalidFilenameCharsREGEX = /[\\~#*{}\/:<>?|"]/gm

// Allowed files according to https://github.com/exelix11/SwitchThemeInjector/blob/master/SwitchThemesCommon/PatchTemplate.cs#L10-L29
export const allowedFilesInNXTheme = [
    'info.json',
    'image.dds',
    'image.jpg',
    'layout.json',
    'common.json',
    'album.dds',
    'album.png',
    'news.dds',
    'news.png',
    'shop.dds',
    'shop.png',
    'controller.dds',
    'controller.png',
    'settings.dds',
    'settings.png',
    'power.dds',
    'power.png',
    'lock.dds',
    'lock.png'
]

export const avatar = (id, user): string => {
    if (user.avatar) {
        return `https://cdn.discordapp.com/avatars/${id}/${user.avatar}`
    } else {
        return `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`
    }
}

// https://stackoverflow.com/questions/40697330/skip-update-columns-with-pg-promise
export function str(column) {
    return {
        name: column,
        skip: (c) => !c.exists
    }
}

// function int(column) {
// 	return {
// 		name: column,
// 		skip: (c) => !c.exists,
// 		init: (c) => +c.value
// 	}
// }

export const themesCS = new pgp.helpers.ColumnSet(
    [
        {name: 'layout_id', cast: 'int'},
        {name: 'piece_uuids', cast: 'uuid[]'},
        'target',
        {name: 'last_updated', cast: 'timestamp without time zone'},
        {name: 'categories', cast: 'varchar[]'},
        {name: 'pack_id', cast: 'int'},
        {name: 'creator_id', cast: 'varchar'},
        {name: 'details', cast: 'json'},
        {name: 'bg_type', cast: 'varchar (3)'}
    ],
    {
        table: 'themes'
    }
)

export const packsCS = new pgp.helpers.ColumnSet(
    [
        {name: 'last_updated', cast: 'timestamp without time zone'},
        {name: 'creator_id', cast: 'varchar'},
        {name: 'details', cast: 'json'}
    ],
    {
        table: 'packs'
    }
)

export const updateCreatorCS = new pgp.helpers.ColumnSet(
    [str('custom_username'), str('bio'), str('banner_image'), str('logo_image'), str('profile_color')],
    {
        table: 'creators'
    }
)

export const createInfo = (themeName, creatorName, target, layoutDetails) => {
    let LayoutInfo = ''
    if (layoutDetails) {
        LayoutInfo = `${layoutDetails.PatchName} by ${layoutDetails.AuthorName || 'Themezer'}`
    }
    return {
        Version: 14,
        ThemeName: themeName,
        Author: creatorName || 'Themezer',
        Target: target,
        LayoutInfo
    }
}

export const saveFiles = (files) =>
    files.map(
        ({file, savename, path}) =>
            new Promise<any>(async (resolve, reject) => {
                try {
                    let {createReadStream, filename} = await file
                    const stream = createReadStream()

                    // Add file extension if none to prevent errors with matching file and directory names
                    const FILE_EXTENSION_REGEX = /\.[^\/.]+$/
                    if (!FILE_EXTENSION_REGEX.test(filename)) {
                        filename = `${savename || filename}.file`
                    } else if (savename) {
                        filename = savename + FILE_EXTENSION_REGEX.exec(filename)
                    }

                    const writeStream = createWriteStream(`${path}/${filename}`)

                    writeStream.on('finish', () => {
                        resolve(`${filename}`)
                    })

                    writeStream.on('error', (error) => {
                        unlink(path, () => {
                            // If the uploaded file's size is too big return specific error
                            if (error.message.includes('exceeds') && error.message.includes('size limit')) {
                                reject(errorName.FILE_TOO_BIG)
                            } else {
                                console.error(error)
                                reject(errorName.FILE_SAVE_ERROR)
                            }
                        })
                    })

                    stream.on('error', (error) => writeStream.destroy(error))

                    stream.pipe(writeStream)
                } catch (e) {
                    reject(e)
                }
            })
    )

export const mergeJson = (baseParsed, jsonArray) => {
    while (jsonArray.length > 0) {
        const shifted = jsonArray.shift()

        // Merge files patches
        if (Array.isArray(baseParsed.Files)) {
            baseParsed.Files = patch(baseParsed.Files, JSON.parse(shifted).Files, [
                'FileName',
                'PaneName',
                'PropName',
                'GroupName',
                'name',
                'MaterialName',
                'unknown'
            ])
        }

        // Merge animation files patches
        if (Array.isArray(baseParsed.Anims)) {
            baseParsed.Anims = patch(baseParsed.Anims, JSON.parse(shifted).Anims, ['FileName'])
        }
    }

    return baseParsed
}

export const createJson = async (id, piece_uuids = [], common?) => {
    let finalJsonObject
    const usedPieces = []

    // If common layout, dont get the pieces
    if (common) {
        const dbData = await db.one(
                `
			SELECT commonlayout, uuid
			FROM layouts
			WHERE id = hex_to_int('$1^')
			LIMIT 1
		`,
            [id]
        )

        finalJsonObject = JSON.parse(dbData.commonlayout)
    } else {
        const dbData = await db.one(
                `
			SELECT baselayout, uuid,
				(
					SELECT array_agg(row_to_json(pcs)) AS pieces
					FROM (
						SELECT unnest(pieces) ->> 'name' as name, json_array_elements(unnest(pieces)->'values') as value
						FROM layouts
						WHERE id = mt.id
					) as pcs
					WHERE value ->> 'uuid' = ANY($2::text[])
				)
	
			FROM layouts as mt
			WHERE mt.id = hex_to_int('$1^')
			LIMIT 1
		`,
            [id, piece_uuids]
        )

        // Create an array with all used pieces

        if (dbData.pieces) {
            dbData.pieces.forEach((p) => {
                usedPieces.push({
                    uuid: p.value.uuid,
                    json: p.value.json
                })
            })
        }

        const baseJsonObject = JSON.parse(dbData.baselayout)

        const jsonArray = usedPieces.map((p) => p.json)

        finalJsonObject = mergeJson(baseJsonObject, jsonArray)
    }

    if (finalJsonObject) {
        // Recreate the file layout
        const ordered = {
            PatchName: finalJsonObject.PatchName,
            AuthorName: finalJsonObject.AuthorName,
            TargetName: finalJsonObject.TargetName,
            ID: stringifyThemeID({
                service: 'Themezer',
                id: id + (finalJsonObject.TargetName === 'common.szs' ? '-common' : ''),
                piece_uuids: usedPieces.map((p) => p.uuid)
            }),
            Files: finalJsonObject.Files,
            Anims: finalJsonObject.Anims
        }

        // Return as prettified string
        return JSON.stringify(ordered, null, 2)
    } else return null
}

export const createNXThemes = (themes) =>
    themes.map(
        (theme) =>
            new Promise<Object>(async (resolve, reject) => {
                try {
                    // Read the dir contents that should be in the NXTheme
                    const filesInFolder = await readdir(theme.path)

                    // Check if there's a layout.json
                    let layoutDetails = null
                    if (filesInFolder.includes('layout.json')) {
                        layoutDetails = JSON.parse(await readFile(`${theme.path}/layout.json`, 'utf8'))
                    }

                    // Create info preferably with the one in the layout or the specified target
                    const info = createInfo(
                        theme.themeName,
                        theme.creatorName,
                        fileNameToThemeTarget(theme.targetName || layoutDetails?.TargetName),
                        layoutDetails
                    )

                    // Write the info.json to the dir
                    await writeFile(`${theme.path}/info.json`, JSON.stringify(info), 'utf8')

                    // Run SARC-Tool main.py on the specified folder
                    const options = {
                        pythonPath: 'python3.8',
                        scriptPath: sarcToolPath,
                        // Compression 0, to reduce stress on CPU
                        args: ['-little', '-compress', '0', '-o', `${theme.path}/theme.nxtheme`, theme.path]
                    }
                    PythonShell.run('main.py', options, async function (err) {
                        if (err) {
                            console.error(err)
                            reject(errorName.NXTHEME_CREATE_FAILED)
                            rimraf(theme.path, () => {
                            })
                            return
                        }

                        // Return NXTheme data as Base64 encoded string
                        resolve({
                            name: theme.themeName,
                            filename:
                                (`${theme.themeName} by ${info.Author}` +
                                    (info.LayoutInfo.length > 0 ? ` using ${info.LayoutInfo}` : '') +
                                    (theme.id ? `-${theme.id}` : '') +
                                    '.nxtheme').replace(invalidFilenameCharsREGEX, '_'),
                            path: `${theme.path}/theme.nxtheme`,
                            mimetype: 'application/nxtheme'
                        })
                    })
                } catch (e) {
                    reject(e)
                    rimraf(theme.path, () => {
                    })
                }
            })
    )

export const unpackNXThemes = (paths) =>
    paths.map(
        (path) =>
            new Promise<String>((resolve, reject) => {
                try {
                    // Run SARC-Tool main.py on the specified file
                    const options = {
                        pythonPath: 'python3.8',
                        scriptPath: sarcToolPath,
                        args: [path]
                    }
                    PythonShell.run('main.py', options, async function (err) {
                        if (err) {
                            console.error(err)
                            reject(errorName.NXTHEME_UNPACK_FAILED)
                            return
                        }

                        // Return extracted dir path
                        resolve(path.replace(/\.[^\/.]+$/, ''))
                    })
                } catch (e) {
                    reject(e)
                }
            })
    )

export const prepareNXTheme = (id, piece_uuids) => {
    return new Promise((resolve, reject) => {
        tmp.dir({unsafeCleanup: false}, async (err, path, cleanupCallback) => {
            if (err) {
                reject(err)
                return
            }

            try {
                // Get the theme details

                const {
                    theme_id,
                    layout_id,
                    name,
                    target,
                    creator_name,
                    theme_piece_uuids,
                    last_updated,
                    layout_last_updated
                } = await db.one(
                        `
						SELECT to_hex(theme.id) as theme_id, to_hex(theme.layout_id) as layout_id, theme.details ->> 'name' as name, theme.target, piece_uuids as theme_piece_uuids, theme.last_updated, layout.last_updated as layout_last_updated,
							(	
								SELECT CASE WHEN custom_username IS NOT NULL THEN custom_username ELSE discord_user ->> 'username' END
								FROM creators
								WHERE id = theme.creator_id	
								LIMIT 1
							) as creator_name
						FROM themes theme
						LEFT JOIN layouts layout ON theme.layout_id = layout.id
						WHERE theme.id = hex_to_int('$1^')
						LIMIT 1
					`,
                    [id]
                )

                if (!piece_uuids) piece_uuids = theme_piece_uuids

                try {
                    const cacheEntry = await db.oneOrNone(
                            `
							SELECT filename, name, last_built
							FROM themes_cache
							WHERE id = hex_to_int('$1^') AND piece_uuids = $2::uuid[]
						`,
                        [theme_id, piece_uuids || []]
                    )

                    let fileNotExists = false
                    if (cacheEntry) {
                        try {
                            await access(
                                `${storagePath}/cache/themes/${theme_id +
                                (piece_uuids?.length > 0 ? `_${piece_uuids.join(',')}` : '')}.nxtheme`,
                                constants.R_OK | constants.W_OK
                            )
                        } catch (e) {
                            fileNotExists = true
                        }
                    }

                    let newFilename, newName
                    if (
                        !cacheEntry ||
                        last_updated > cacheEntry.last_built ||
                        layout_last_updated > cacheEntry.last_built ||
                        fileNotExists
                    ) {
                        // Rebuild

                        // Symlink all other allowedFilesInNXTheme
                        const filesInFolder = await readdir(`${storagePath}/themes/${theme_id}`)
                        const linkAllPromises = filesInFolder.map((file) =>
                            link(`${storagePath}/themes/${theme_id}/${file}`, `${path}/${file}`)
                        )
                        await Promise.all(linkAllPromises)

                        // Get merged layout json if any
                        if (layout_id) {
                            const layoutJson = await createJson(layout_id, piece_uuids)
                            await writeFile(`${path}/layout.json`, layoutJson, 'utf8')
                        }

                        // Get optional common json
                        let commonJson = null
                        if (layout_id) {
                            commonJson = await createJson(layout_id, null, true)
                            if (commonJson) {
                                await writeFile(`${path}/common.json`, commonJson, 'utf8')
                            }
                        }

                        // Make NXTheme
                        const themes = [
                            {
                                id: theme_id,
                                path: path,
                                themeName: name,
                                targetName: target,
                                creatorName: creator_name
                            }
                        ]

                        const themePromises = createNXThemes(themes)
                        const themesReturned: any = await Promise.all(themePromises)

                        newFilename = themesReturned[0].filename
                        newName = themesReturned[0].name

                        await moveFile(
                            themesReturned[0].path,
                            `${storagePath}/cache/themes/${theme_id +
                            (piece_uuids?.length > 0 ? `_${piece_uuids.join(',')}` : '')}.nxtheme`
                        )

                        await db.none(
                                `
							INSERT INTO themes_cache (id, piece_uuids, filename, name, last_built)
							VALUES(hex_to_int('$1^'), $2::uuid[], $3, $4, NOW()) 
							ON CONFLICT (id, piece_uuids) 
							DO 
								UPDATE SET 
									filename = $3,
									name = $4,
									last_built = NOW();
								
						`,
                            [theme_id, piece_uuids || [], newFilename || cacheEntry.filename, newName || cacheEntry.name]
                        )
                    }

                    resolve({
                        id: theme_id,
                        name: newName || cacheEntry.name,
                        target: fileNameToThemeTarget(target),
                        preview: `${process.env.API_ENDPOINT}/cdn/themes/${theme_id}/images/original.jpg`,
                        thumbnail: `${process.env.API_ENDPOINT}/cdn/themes/${theme_id}/images/thumb.jpg`,
                        localfilename: `${theme_id +
                        (piece_uuids?.length > 0 ? `_${piece_uuids.join(',')}` : '')}.nxtheme`,
                        filename: newFilename || cacheEntry.filename,
                        path: `${storagePath}/cache/themes/${theme_id +
                        (piece_uuids?.length > 0 ? `_${piece_uuids.join(',')}` : '')}.nxtheme`,
                        mimetype: 'application/nxtheme'
                    })

                    // Increase download count by 1 and set cache
                    await db.none(
                            `
							UPDATE themes
								SET dl_count = dl_count + 1
							WHERE id = hex_to_int('$1^');
						`,
                        [theme_id]
                    )

                    cleanupCallback()
                } catch (e) {
                    console.error(e)
                    reject(errorName.NXTHEME_CREATE_FAILED)
                    cleanupCallback()
                }
            } catch (e) {
                console.error(e)
                reject(errorName.THEME_NOT_FOUND)
                cleanupCallback()
            }
        })
    })
}

export const getTheme = (id, piece_uuids) => {
    return new Promise(async (resolve, reject) => {
        try {
            const themePromise: any = await prepareNXTheme(id, piece_uuids)

            resolve({
                name: themePromise.name,
                target: themePromise.target,
                preview: themePromise.preview,
                thumbnail: themePromise.thumbnail,
                filename: themePromise.filename,
                id: themePromise.id,
                url: `${process.env.API_ENDPOINT}/cdn/cache/themes/${themePromise.localfilename}`,
                mimetype: themePromise.mimetype
            })

            resolve(themePromise)
        } catch (e) {
            console.error(e)
            reject(e)
        }
    })
}

export const downloadPackSeperate = (id) => {
    return new Promise(async (resolve, reject) => {
        // Get the pack details and theme ids
        let pack = null
        try {
            pack = await db.many(
                    `
						SELECT
							to_hex("themes".id) AS "theme_id",
							"pack".details -> 'name' as pack_name
						FROM packs "pack"
						LEFT JOIN packs "details" ON "pack".id = "details".id
						LEFT JOIN themes "themes" ON "pack".id = "themes".pack_id
						WHERE "pack".id = hex_to_int('$1^')
						ORDER BY order_by_array(Array['ResidentMenu', 'Entrance', 'Flaunch', 'Set', 'Psl', 'MyPage', 'Notification'], "themes".target), "themes".details ->> 'name' COLLATE "en-US-x-icu" ASC
					`,
                [id]
            )
        } catch (e) {
            console.error(e)
            reject(errorName.PACK_NOT_FOUND)
            return
        }

        try {
            // Create the NXThemes
            const themePromises = pack.map((pack) => prepareNXTheme(pack.theme_id, undefined))
            const themesReturned: Array<any> = await Promise.all(themePromises)

            const shouldResolve = themesReturned.map((t) => {
                return {
                    name: t.name,
                    pack_name: pack[0].pack_name,
                    target: t.target,
                    preview: t.preview,
                    thumbnail: t.thumbnail,
                    filename: t.filename,
                    id: t.id,
                    url: `${process.env.API_ENDPOINT}/cdn/cache/themes/${t.localfilename}`,
                    mimetype: t.mimetype
                }
            })

            resolve(shouldResolve)

            // Increase download count by 1
            db.none(
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
                [id]
            )
        } catch (e) {
            console.error(e)
            reject(e)
        }
    })
}

export const filterData = (items, info, {page = 1, limit, query, sort, order = 'desc', layouts, nsfw = false}) => {
    const queryFields = graphqlFields(info)

    if (items?.length > 0) {
        if (query) {
            if (
                !(
                    !!queryFields.id &&
                    !!queryFields.details?.name &&
                    !!queryFields.details?.description &&
                    !!(info.fieldName !== 'layoutList' ? queryFields.categories : true)
                )
            ) {
                throw errorName.CANNOT_SEARCH_QUERY
            }

            const miniSearch = new MiniSearch({
                fields: ['id', 'name', 'description', 'categories'],
                storeFields: ['id'],
                searchOptions: {
                    // boost: { name: 2 },
                    fuzzy: 0.1
                }
            })

            const itms = items.map((item: any) => {
                return {
                    id: info.fieldName.charAt(0) + item.id,
                    name: item.details.name,
                    description: item.details.name,
                    categories: item.categories ? item.categories.join(' ') : ''
                }
            })

            miniSearch.addAll(itms)
            const rs = miniSearch.search(query, {
                prefix: true
            })
            const resultIDs = rs.map((r: any) => r.id)

            items = items.filter((item: any) => resultIDs.includes(info.fieldName.charAt(0) + item.id))
        }

        if (!nsfw && info.fieldName !== 'layoutList') {
            items = items.filter((item: any): boolean => {
                if (!queryFields.categories) throw errorName.CANNOT_FILTER_NSFW
                else return !item.categories?.includes('NSFW')
            })
        }

        if (layouts?.length > 0) {
            items = items.filter((item: any): boolean => {
                if (info.fieldName === 'packList' ? !queryFields.themes.layout?.id : !queryFields.layout?.id)
                    throw errorName.CANNOT_FILTER_LAYOUTS
                return layouts.some((id: string) => {
                    if (item.themes) {
                        // Pack
                        return item.themes.some((t: any) => t.layout?.id === id)
                    } else if (item.layout) {
                        // Theme
                        return item.layout.id === id
                    } else return false
                })
            })
        }

        if (sort) {
            items = items.sort((a: any, b: any) => {
                const sortOptions = [
                    {
                        id: 'downloads',
                        key: 'dl_count'
                    },
                    {
                        id: 'likes',
                        key: 'like_count'
                    },
                    {
                        id: 'updated',
                        key: 'last_updated'
                    },
                    {
                        id: 'id',
                        key: 'id'
                    }
                ]

                const sortOption = sortOptions.find((o: any) => o.id === sort)
                if (!sortOption) throw errorName.INVALID_SORT

                if (sortOption.id === 'downloads' && !queryFields.dl_count) throw errorName.CANNOT_SORT_BY_DOWNLOADS
                if (sortOption.id === 'likes' && !queryFields.like_count) throw errorName.CANNOT_SORT_BY_LIKES
                if (sortOption.id === 'updated' && order.toLowerCase() === 'asc' && !queryFields.last_updated)
                    throw errorName.CANNOT_SORT_BY_UPDATED
                if (sortOption.id === 'id') return 0

                if (order.toLowerCase() === 'asc') {
                    return a[sortOption.key] - b[sortOption.key]
                } else if (order.toLowerCase() === 'desc') {
                    return b[sortOption.key] - a[sortOption.key]
                } else {
                    throw errorName.INVALID_ORDER
                }
            })
        }

        const item_count = items.length

        let page_count = 1
        if (limit) {
            page_count = Math.ceil(item_count / limit)
        }

        const start = (page - 1) * limit
        const end = start + limit

        return {
            items: limit ? items.slice(start, end) : items,
            pagination: {
                page: page || 1,
                limit,
                page_count,
                item_count
            }
        }
    } else {
        return {
            items: [],
            pagination: {
                page,
                limit,
                page_count: 0,
                item_count: 0
            }
        }
    }
}

// noinspection ES6ShorthandObjectProperty
export default {
    JSON: GraphQLJSON,
    Query: {
        me,

        creator,

        categories,

        layout,
        theme,
        pack,

        randomLayoutIDs,
        randomThemeIDs,
        randomPackIDs,

        layoutList: list,
        themeList: list,
        packList: list,

        downloadLayout,
        downloadCommonLayout,
        downloadTheme,
        downloadPack,

        nxinstaller,

        createOverlayNXThemes,
        createOverlay
    },
    Mutation: {
        updateAuth,
        restoreAccount,
        updateProfile,

        uploadSingleOrZip,
        submitThemes,

        setLike,

        deleteTheme,
        updateTheme,
        deletePack,
        updatePack,

        reportURL
    }
}
