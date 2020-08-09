const util = require('util')
import { pgp, db } from '../db/db'
import {
	fileNameToThemeTarget,
	themeTargetToFileName,
	fileNameToWebName,
	validFileName,
	validThemeTarget
} from '../util/targetParser'
import graphqlFields from 'graphql-fields'
import MiniSearch from 'minisearch'
import { errorName } from '../util/errorTypes'

import webhook from 'webhook-discord'
import { packMessage, themeMessage } from '../util/webhookMessages'
const Hook = new webhook.Webhook(process.env.WEBHOOK_URL)

import joinMonster from 'join-monster'
const joinMonsterOptions: any = { dialect: 'pg' }

import { uuid } from 'uuidv4'
import { encrypt, decrypt } from '../util/crypt'
import { parseThemeID, stringifyThemeID } from '@themezernx/layout-id-parser'
const { patch } = require('@tromkom/aurora-strategic-json-merge-patch')
import GraphQLJSON from 'graphql-type-json'
import { PythonShell } from 'python-shell'
import filterAsync from 'node-filter-async'
const link = require('fs-symlink')
const {
	createWriteStream,
	unlink,
	readdir,
	lstat,
	promises: { mkdir, access, readFile, writeFile, rename },
	constants
} = require('fs')
const readdirPromisified = util.promisify(readdir)
const moveFile = require('move-file')
const tmp = require('tmp')
const rimraf = require('rimraf')

const im = require('imagemagick')

const YAZ0_FILE = require('is-yaz0-file')
const JPEG_FILE = require('is-jpeg-file')
const ZIP_FILE = require('is-zip-file')
const isYaz0Promisified = util.promisify(YAZ0_FILE.isYaz0)
const isJpegPromisified = util.promisify(JPEG_FILE.isJpeg)
const isZipPromisified = util.promisify(ZIP_FILE.isZip)
const AdmZip = require('adm-zip')
const extract = require('extract-zip')

const sarcToolPath = `${__dirname}/../../../SARC-Tool`
const storagePath = `${__dirname}/../../../cdn`
const urlNameREGEX = /[^a-zA-Z0-9_.]+/gm
const noSpecialCharsREGEX = /[^a-z\d\-]+/gi

// Allowed files according to https://github.com/exelix11/SwitchThemeInjector/blob/master/SwitchThemesCommon/PatchTemplate.cs#L10-L29
const allowedFilesInNXTheme = [
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

const avatar = (id, user): string => {
	if (user.avatar) {
		return `https://cdn.discordapp.com/avatars/${id}/${user.avatar}`
	} else {
		return `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`
	}
}

// https://stackoverflow.com/questions/40697330/skip-update-columns-with-pg-promise
function str(column) {
	return {
		name: column,
		skip: (c) => !c.exists
	}
}

function int(column) {
	return {
		name: column,
		skip: (c) => !c.exists,
		init: (c) => +c.value
	}
}

const themesCS = new pgp.helpers.ColumnSet(
	[
		{ name: 'layout_id', cast: 'int' },
		{ name: 'piece_uuids', cast: 'uuid[]' },
		'target',
		{ name: 'last_updated', cast: 'timestamp without time zone' },
		{ name: 'categories', cast: 'varchar[]' },
		{ name: 'pack_id', cast: 'int' },
		{ name: 'creator_id', cast: 'varchar' },
		{ name: 'details', cast: 'json' },
		{ name: 'bg_type', cast: 'varchar (3)' }
	],
	{
		table: 'themes'
	}
)

const packsCS = new pgp.helpers.ColumnSet(
	[
		{ name: 'last_updated', cast: 'timestamp without time zone' },
		{ name: 'creator_id', cast: 'varchar' },
		{ name: 'details', cast: 'json' }
	],
	{
		table: 'packs'
	}
)

const updateCreatorCS = new pgp.helpers.ColumnSet(
	[str('role'), str('custom_username'), str('bio'), str('banner_image'), str('logo_image'), str('profile_color')],
	{
		table: 'creators'
	}
)

const createInfo = (themeName, creatorName, target, layoutDetails) => {
	let LayoutInfo = null
	if (layoutDetails) {
		LayoutInfo = `${layoutDetails.PatchName} by ${layoutDetails.AuthorName || 'Themezer'}`
	}
	return {
		Version: 12,
		ThemeName: themeName,
		Author: creatorName || 'Themezer',
		Target: target,
		LayoutInfo
	}
}

const saveFiles = (files) =>
	files.map(
		({ file, savename, path }) =>
			new Promise<any>(async (resolve, reject) => {
				try {
					let { createReadStream, filename, mimetype } = await file
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

const mergeJson = (baseParsed, jsonArray) => {
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

const createJson = async (id, piece_uuids = [], common?) => {
	let finalJsonObject = null
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

const createNXThemes = (themes) =>
	themes.map(
		(theme) =>
			new Promise<Object>(async (resolve, reject) => {
				try {
					// Read the dir contents that should be in the NXTheme
					const filesInFolder = await readdirPromisified(theme.path)

					// Check if there's a layout.json
					let layoutDetails = null
					if (filesInFolder.includes('layout.json')) {
						layoutDetails = JSON.parse(await readFile(`${theme.path}/layout.json`, 'utf8'))
					}

					// Create info preferably with the one in the layout or the specified target
					const info = createInfo(
						theme.themeName,
						theme.creatorName,
						fileNameToThemeTarget(layoutDetails ? layoutDetails.TargetName : theme.targetName),
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
					PythonShell.run('main.py', options, async function(err) {
						if (err) {
							console.error(err)
							reject(errorName.NXTHEME_CREATE_FAILED)
							rimraf(theme.path, () => {})
							return
						}

						// Return NXTheme data as Base64 encoded string
						resolve({
							name: `${theme.themeName} by ${info.Author}`,
							filename:
								`${theme.themeName} by ${info.Author}` +
								(info.LayoutInfo ? ` using ${info.LayoutInfo}` : '') +
								'.nxtheme',
							path: `${theme.path}/theme.nxtheme`,
							mimetype: 'application/nxtheme'
						})
					})
				} catch (e) {
					reject(e)
					rimraf(theme.path, () => {})
				}
			})
	)

const unpackNXThemes = (paths) =>
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
					PythonShell.run('main.py', options, async function(err) {
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

const prepareNXTheme = (id, piece_uuids) => {
	return new Promise((resolve, reject) => {
		tmp.dir({ unsafeCleanup: false }, async (err, path, cleanupCallback) => {
			if (err) {
				reject(err)
				return
			}

			try {
				// Get the theme details

				const {
					layout_id,
					name,
					target,
					creator_name,
					theme_piece_uuids,
					last_updated,
					layout_last_updated
				} = await db.one(
					`
						SELECT int_to_padded_hex(theme.layout_id) as layout_id, theme.details ->> 'name' as name, theme.target, piece_uuids as theme_piece_uuids, theme.last_updated, layout.last_updated as layout_last_updated,
							(	
								SELECT discord_user ->> 'username'
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

				try {
					const cacheEntry = await db.oneOrNone(
						`
							SELECT filename, name, last_built
							FROM themes_cache
							WHERE id = hex_to_int('$1^') AND piece_uuids = $2::uuid[]
						`,
						[id, piece_uuids || []]
					)

					let newFilename, newName
					if (
						!cacheEntry ||
						last_updated > cacheEntry.last_built ||
						layout_last_updated > cacheEntry.last_built
					) {
						// Rebuild

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

						// Symlink all other allowedFilesInNXTheme
						const filesInFolder = await readdirPromisified(`${storagePath}/themes/${id}`)
						const linkAllPromises = filesInFolder.map((file) => {
							if (file !== 'screenshot.jpg') {
								return link(`${storagePath}/themes/${id}/${file}`, `${path}/${file}`)
							} else return null
						})
						await Promise.all(linkAllPromises)

						// Make NXTheme
						const themes = [
							{
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
							`${storagePath}/cache/themes/${id +
								(piece_uuids?.length > 0 ? `_${piece_uuids.join(',')}` : '')}.nxtheme`
						)
					}

					resolve({
						id: id,
						name: newName || cacheEntry.name,
						target: fileNameToThemeTarget(target),
						screenshot: `${process.env.API_ENDPOINT}cdn/themes/${id}/screenshot.jpg`,
						localfilename: `${id + (piece_uuids?.length > 0 ? `_${piece_uuids.join(',')}` : '')}.nxtheme`,
						filename: newFilename || cacheEntry.filename,
						path: `${storagePath}/cache/themes/${id +
							(piece_uuids?.length > 0 ? `_${piece_uuids.join(',')}` : '')}.nxtheme`,
						mimetype: 'application/nxtheme'
					})

					// Increase download count by 1 and set cache
					db.none(
						`
							UPDATE themes
								SET dl_count = dl_count + 1
							WHERE id = hex_to_int('$1^');
	
							INSERT INTO themes_cache (id, piece_uuids, filename, name, last_built)
							VALUES(hex_to_int('$1^'), $2::uuid[], $3, $4, NOW()) 
							ON CONFLICT (id, piece_uuids) 
							DO 
								UPDATE SET 
									filename = $3,
									name = $4,
									last_built = NOW();
								
						`,
						[id, piece_uuids || [], newFilename || cacheEntry.filename, name || cacheEntry.name]
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

const downloadTheme = (id, piece_uuids) => {
	return new Promise(async (resolve, reject) => {
		try {
			const themePromise: any = await prepareNXTheme(id, piece_uuids)

			resolve({
				name: themePromise.name,
				target: themePromise.target,
				preview: themePromise.screenshot,
				filename: themePromise.filename,
				id: themePromise.id,
				url: `${process.env.API_ENDPOINT}cdn/cache/themes/${id +
					(piece_uuids?.length > 0 ? `_${piece_uuids.join(',')}` : '')}.nxtheme`,
				mimetype: themePromise.mimetype
			})

			resolve(themePromise)
		} catch (e) {
			console.error(e)
			reject(e)
		}
	})
}

const downloadPackSeperate = (id) => {
	return new Promise(async (resolve, reject) => {
		// Get the pack details and theme ids
		let pack = null
		try {
			pack = await db.many(
				`
						SELECT
							int_to_padded_hex("themes".id) AS "theme_id"
						FROM packs "pack"
						LEFT JOIN packs "details" ON "pack".id = "details".id
						LEFT JOIN themes "themes" ON "pack".id = "themes".pack_id
						LEFT JOIN layouts "layout" ON "themes".layout_id = "layout".id
						WHERE "pack".id = hex_to_int('$1^')
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

			const shouldResolve = []

			themesReturned.forEach((t) => {
				shouldResolve.push({
					name: t.name,
					target: t.target,
					preview: t.screenshot,
					filename: t.filename,
					id: t.id,
					url: `${process.env.API_ENDPOINT}cdn/cache/themes/${t.localfilename}`,
					mimetype: t.mimetype
				})
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

const filterData = (items, info, { page = 1, limit, query, sort, order = 'desc', creators, layouts, nsfw = false }) => {
	const queryFields = graphqlFields(info)

	if (items && items.length > 0) {
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
					id: item.id,
					name: item.details.name,
					description: item.details.name,
					categories: item.categories ? item.categories.join('|') : ''
				}
			})

			miniSearch.addAll(itms)
			const rs = miniSearch.search(query, {
				prefix: true
			})
			const resultIDs = rs.map((r: any) => r.id)

			items = items.filter((item: any) => resultIDs.includes(item.id))
		}

		items = items
			.filter((item: any): boolean => {
				if (nsfw) {
					if (!queryFields.categories) throw errorName.CANNOT_FILTER_NSFW
					else return !(Array.isArray(item.categories) && item.categories.includes('NSFW'))
				} else return true
			})
			.filter((item: any): boolean => {
				if (layouts && layouts.length > 0) {
					if (!queryFields.layout?.id) throw errorName.CANNOT_FILTER_LAYOUTS
					return layouts.some((id: string) => {
						if (item.themes) {
							// Pack
							return item.themes.some((t: any) => t.layout?.id === id)
						} else if (item.layout) {
							// Theme
							return item.layout.id === id
						} else return false
					})
				} else return true
			})
			.sort((a: any, b: any) => {
				if (sort || order) {
					const sortOptions = [
						{
							title: 'Downloads',
							id: 'downloads',
							key: 'dl_count',
							icon: 'mdi-download-outline'
						},
						{
							title: 'Likes',
							id: 'likes',
							key: 'like_count',
							icon: 'mdi-heart'
						},
						{
							title: 'Updated',
							id: 'updated',
							key: 'last_updated',
							icon: 'mdi-calendar-clock'
						}
					]

					const sortOption = sort ? sortOptions.find((o: any) => o.id === sort) : sortOptions[2]
					if (!sortOption) throw errorName.INVALID_SORT
					if (order.toLowerCase() !== 'asc' || order.toLowerCase() !== 'desc') throw errorName.INVALID_ORDER

					if (sortOption.id === 'downloads' || sortOption.id === 'likes') {
						if (sortOption.id === 'downloads' && !queryFields.dl_count)
							throw errorName.CANNOT_SORT_BY_DOWNLOADS
						if (sortOption.id === 'likes' && !queryFields.dl_count) throw errorName.CANNOT_SORT_BY_LIKES

						if (order.toLowerCase() === 'asc') {
							return a[sortOption.key] - b[sortOption.key]
						} else if (order.toLowerCase() === 'desc') {
							return b[sortOption.key] - a[sortOption.key]
						}
					} else if (sortOption.id === 'updated') {
						if (!queryFields.last_updated) throw errorName.CANNOT_SORT_BY_UPDATED
						if (order.toLowerCase() === 'asc') {
							return new Date(a[sortOption.key]).getTime() - new Date(b[sortOption.key]).getTime()
						} else if (order.toLowerCase() === 'desc') {
							return new Date(b[sortOption.key]).getTime() - new Date(a[sortOption.key]).getTime()
						}
					}
				}
			})

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

export default {
	JSON: GraphQLJSON,
	Query: {
		me: async (_parent, _args, context, info) => {
			try {
				if (await context.authenticate()) {
					return await new Promise(async (resolve, reject) => {
						const dbData = await joinMonster(
							info,
							context,
							(sql) => {
								return db.any(sql)
							},
							joinMonsterOptions
						)

						if (dbData) {
							resolve(dbData)
						} else {
							reject(errorName.UNKNOWN)
						}
					})
				} else {
					throw new Error(errorName.UNAUTHORIZED)
				}
			} catch (e) {
				throw new Error(e)
			}
		},
		creator: async (_parent, _args, context, info) => {
			try {
				return await new Promise(async (resolve, reject) => {
					const dbData = await joinMonster(
						info,
						context,
						(sql) => {
							return db.any(sql)
						},
						joinMonsterOptions
					)

					if (dbData) {
						resolve(dbData)
					} else {
						reject(errorName.CREATOR_NOT_EXIST)
					}
				})
			} catch (e) {
				throw new Error(e)
			}
		},
		categories: async (_parent, _args, _context, _info) => {
			try {
				const categoriesDB = await db.one(`
					SELECT ARRAY(
						SELECT DISTINCT UNNEST(categories)
						FROM themes
					) as categories
				`)

				return categoriesDB.categories
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		layout: async (_parent, _args, context, info) => {
			try {
				return await new Promise(async (resolve, reject) => {
					const dbData = await joinMonster(
						info,
						context,
						(sql) => {
							return db.any(sql)
						},
						joinMonsterOptions
					)

					if (dbData) {
						resolve(dbData)
					} else {
						reject(errorName.LAYOUT_NOT_FOUND)
					}
				})
			} catch (e) {
				throw new Error(e)
			}
		},
		layoutList: async (_parent, args, context, info) => {
			try {
				return await new Promise(async (resolve, reject) => {
					let dbData = await joinMonster(
						info,
						context,
						(sql) => {
							return db.any(sql)
						},
						joinMonsterOptions
					)

					try {
						const filtered = filterData(dbData, info, args)
						context.pagination = filtered.pagination
						resolve(filtered.items)
					} catch (e) {
						reject(e)
					}
				})
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		theme: async (_parent, _args, context, info) => {
			try {
				return await new Promise(async (resolve, reject) => {
					const dbData = await joinMonster(
						info,
						context,
						(sql) => {
							return db.any(sql)
						},
						joinMonsterOptions
					)

					if (dbData) {
						resolve(dbData)
					} else {
						reject(errorName.THEME_NOT_FOUND)
					}
				})
			} catch (e) {
				throw new Error(e)
			}
		},
		themeList: async (_parent, args, context, info) => {
			try {
				return await new Promise(async (resolve, reject) => {
					let dbData = await joinMonster(
						info,
						context,
						(sql) => {
							return db.any(sql)
						},
						joinMonsterOptions
					)

					try {
						const filtered = filterData(dbData, info, args)
						context.pagination = filtered.pagination
						resolve(filtered.items)
					} catch (e) {
						reject(e)
					}
				})
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		pack: async (_parent, _args, context, info) => {
			try {
				return await new Promise(async (resolve, reject) => {
					const dbData = await joinMonster(
						info,
						context,
						(sql) => {
							return db.any(sql)
						},
						joinMonsterOptions
					)

					if (dbData) {
						resolve(dbData)
					} else {
						reject(errorName.PACK_NOT_FOUND)
					}
				})
			} catch (e) {
				throw new Error(e)
			}
		},
		packList: async (_parent, args, context, info) => {
			try {
				return await new Promise(async (resolve, reject) => {
					let dbData = await joinMonster(
						info,
						context,
						(sql) => {
							return db.any(sql)
						},
						joinMonsterOptions
					)

					try {
						const filtered = filterData(dbData, info, args)
						context.pagination = filtered.pagination
						resolve(filtered.items)
					} catch (e) {
						reject(e)
					}
				})
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		nxinstaller: async (_parent, { id, piece_uuids }, context, info) => {
			try {
				return await new Promise(async (resolve, reject) => {
					try {
						if (id.toLowerCase().startsWith('t')) {
							// Theme Download
							resolve([await downloadTheme(id.replace(/t/i, ''), piece_uuids)])
						} else if (id.toLowerCase().startsWith('p')) {
							// Pack Download
							resolve(await downloadPackSeperate(id.replace(/p/i, '')))
						} else {
							reject(errorName.NXINSTALLER_ID_INVALID)
						}
					} catch (e) {
						console.error(e)
						reject(e)
					}
				})
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		downloadTheme: async (_parent, { id, piece_uuids }, context, info) => {
			try {
				return await downloadTheme(id.replace(/t/i, ''), piece_uuids)
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		downloadPack: async (_parent, { id }, _context, _info) => {
			try {
				return await new Promise(async (resolve, reject) => {
					// Get the pack details and theme ids
					let pack = null
					try {
						pack = await db.many(
							`
									SELECT
										"details".details ->> 'name' AS "name",
										CASE WHEN "discord_us".custom_username IS NOT NULL THEN "discord_us".custom_username ELSE "discord_us".discord_user ->> 'username' END AS "creator_name",
										int_to_padded_hex("themes".id) AS "theme_id",
										"pack"."last_updated" AS "last_updated",
										"themes"."last_updated" AS "theme_last_updated",
										"layout"."last_updated" AS "layout_last_updated"
									FROM packs "pack"
									LEFT JOIN packs "details" ON "pack".id = "details".id
									LEFT JOIN creators "creator" ON "pack".creator_id = "creator".id
									LEFT JOIN creators "discord_us" ON "creator".id = "discord_us".id
									LEFT JOIN themes "themes" ON "pack".id = "themes".pack_id
									LEFT JOIN layouts "layout" ON "themes".layout_id = "layout".id
									WHERE "pack".id = hex_to_int('$1^')
								`,
							[id]
						)
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
							[id]
						)

						let shouldRebuild = false

						if (cacheEntry) {
							pack.forEach((t) => {
								if (
									t.last_updated > cacheEntry.last_built ||
									t.theme_last_updated > cacheEntry.last_built ||
									t.layout_last_updated > cacheEntry.last_built
								)
									shouldRebuild = true
							})
						} else {
							shouldRebuild = true
						}

						if (shouldRebuild) {
							// Create the NXThemes
							const themePromises = pack.map((pack) => prepareNXTheme(pack.theme_id, undefined))
							const themesReturned: Array<any> = await Promise.all(themePromises)

							// Create zip
							// Use basic for-loop instead of promises to prevent 'MaxListenersExceededWarning' (I guess):
							const zip = new AdmZip()
							for (const i in themesReturned) {
								try {
									await zip.addLocalFile(themesReturned[i].path, null, themesReturned[i].filename)
								} catch (e) {
									console.error(e)
									reject(errorName.PACK_CREATE_FAILED)
									return
								}
							}

							// Write zip to cache
							await zip.writeZip(`${storagePath}/cache/packs/${id}.zip`)
						}

						resolve({
							filename: `${pack[0].name} by ${pack[0].creator_name} via Themezer.zip`,
							url: `${process.env.API_ENDPOINT}cdn/cache/packs/${id}.zip`,
							mimetype: 'application/zip'
						})

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
						reject(errorName.PACK_CREATE_FAILED)
					}
				})
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		downloadLayout: async (_parent, { id, piece_uuids }, _context, _info) => {
			try {
				return await new Promise(async (resolve, _reject) => {
					const json = await createJson(id, piece_uuids)
					resolve(json)

					// Increase download count by 1
					db.none(
						`
							UPDATE layouts
								SET dl_count = dl_count + 1
							WHERE  id = hex_to_int('$1^')
						`,
						[id]
					)
				})
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		downloadCommonLayout: async (_parent, { id }, _context, _info) => {
			try {
				return await new Promise(async (resolve, _reject) => {
					const json = await createJson(id, null, true)
					resolve(json)
				})
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		createOverlayNXThemes: async (_parent, { layout, piece, common }, _context, _info) => {
			try {
				return await new Promise((resolve, reject) => {
					tmp.dir({ unsafeCleanup: true }, async (err, path, cleanupCallback) => {
						if (err) {
							reject(err)
							return
						}

						try {
							const filesToSave = [{ file: layout, path }]

							if (!!piece) {
								filesToSave[1] = { file: piece, path }
							}

							if (!!common) {
								filesToSave[2] = { file: common, path }
							}

							const filePromises = saveFiles(filesToSave)
							const files = await Promise.all(filePromises)
							const layoutJson = await readFile(`${path}/${files[0]}`, 'utf8')

							const piecesJson = []

							if (!!piece) {
								piecesJson.push(await readFile(`${path}/${files[1]}`, 'utf8'))
							}

							const layoutJsonParsed = JSON.parse(layoutJson)

							if (!!common && layoutJsonParsed.Target === 'common.szs') {
								reject(errorName.NO_COMMON_ALLOWED)
								return
							}

							const json = mergeJson(layoutJsonParsed, piecesJson)
							await writeFile(`${path}/layout_merged.json`, JSON.stringify(json, null, 4))

							const linkPromises = [
								link(`${path}/layout_merged.json`, `${path}/black/layout.json`),
								link(`${__dirname}/../../images/BLACK.dds`, `${path}/black/image.dds`),
								link(`${path}/layout_merged.json`, `${path}/white/layout.json`),
								link(`${__dirname}/../../images/WHITE.dds`, `${path}/white/image.dds`)
							]

							if (!!common) {
								linkPromises.push(link(`${path}/${files[2]}`, `${path}/black/common.json`))
								linkPromises.push(link(`${path}/${files[2]}`, `${path}/white/common.json`))
							}

							// Symlink the files to the two dirs
							await Promise.all(linkPromises)

							// Make NXThemes
							const themes = [
								{
									path: `${path}/black`,
									themeName: 'Black background'
								},
								{
									path: `${path}/white`,
									themeName: 'White background'
								}
							]
							const themePromises = createNXThemes(themes)
							const themesReturned: Array<any> = await Promise.all(themePromises)

							const themesB64 = []
							for (const i in themesReturned) {
								themesB64.push({
									filename: themesReturned[i].filename,
									url: await readFile(`${themesReturned[i].path}/theme.nxtheme`, 'base64'),
									mimetype: themesReturned[i].mimetype
								})
							}

							resolve(themesB64)

							cleanupCallback()
						} catch (e) {
							reject(e)
							rimraf(path, () => {})
						}
					})
				})
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		createOverlay: async (_parent, { themeName, blackImg, whiteImg }, _context, _info) => {
			try {
				return await new Promise((resolve, reject) => {
					tmp.dir({ unsafeCleanup: true }, async (err, path, cleanupCallback) => {
						if (err) {
							reject(err)
							return
						}

						const filePromises = saveFiles([
							{ file: blackImg, path },
							{ file: whiteImg, path }
						])
						const files = await Promise.all(filePromises)

						im.convert(
							[
								`${path}/${files[0]}`,
								`${path}/${files[1]}`,
								'-alpha',
								'off',
								'(',
								'-clone',
								'0,1',
								'-compose',
								'difference',
								'-composite',
								'-threshold',
								'50%',
								'-negate',
								')',
								'(',
								'-clone',
								'0,2',
								'+swap',
								'-compose',
								'divide',
								'-composite',
								')',
								'-delete',
								'0,1',
								'+swap',
								'-compose',
								'Copy_Opacity',
								'-composite',
								`${path}/overlay.png`
							],
							async function(err, _stdout, stderr) {
								if (err || stderr) {
									console.error(err)
									console.error(stderr)
									reject(errorName.FILE_READ_ERROR)
									rimraf(path, () => {})
									cleanupCallback()
									return
								} else {
									resolve({
										filename: themeName ? `${themeName}_overlay.png` : `overlay.png`,
										data: await readFile(`${path}/overlay.png`, 'base64'),
										mimetype: 'image/png'
									})
								}
							}
						)
					})
				})
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		}
	},
	Mutation: {
		updateAuth: async (_parent, { accepts }, context, _info) => {
			try {
				if (await context.authenticate()) {
					let dbData
					if (accepts) {
						dbData = await db.one(
							`
								UPDATE creators
									SET has_accepted = true
								WHERE id = $1
								RETURNING has_accepted
							`,
							[context.req.user.id]
						)
					}
					return context.req.user.has_accepted
						? {
								has_accepted: true
						  }
						: dbData && dbData.has_accepted
						? {
								has_accepted: true
						  }
						: {
								has_accepted: false,
								backup_code: context.req.user.backup_code
						  }
				} else {
					throw errorName.UNAUTHORIZED
				}
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		restoreAccount: async (_parent, { creator_id, backup_code }, context, _info) => {
			try {
				if (await context.authenticate()) {
					const dbData = await db.oneOrNone(
						`
							WITH valid AS (
								SELECT case when count(*) > 0 then true else false end
									FROM creators
									WHERE id = $3
										AND backup_code = $4
							),
							new_creator AS (
								DELETE FROM creators
								WHERE id = $1
									AND (SELECT * FROM valid)
								RETURNING id
							),
							restored AS (
								UPDATE creators
									SET id = (select id from new_creator),
										has_accepted = false,
										discord_user = $2,
										backup_code = md5(random()::varchar)::varchar,
										old_ids = array_append(old_ids, $3)
								WHERE id = $3
									AND (SELECT * FROM valid)
								RETURNING id
							)
							
							SELECT *
							FROM restored
							`,
						[context.req.user.id, context.req.user.discord_user, creator_id, backup_code]
					)
					return dbData ? true : false
				} else {
					throw errorName.UNAUTHORIZED
				}
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		updateProfile: async (
			_parent,
			{ custom_username, bio, profile_color, banner_image, logo_image, clear_banner_image, clear_logo_image },
			context,
			_info
		) => {
			try {
				if (await context.authenticate()) {
					return await new Promise(async (resolve, reject) => {
						try {
							let object: any = {
								custom_username: custom_username,
								bio: bio?.replace(/<script>.*?<\/script>/gm, ''), // Remove script tags for cross-site scripting
								profile_color: profile_color
							}

							const toSavePromises = []
							const bannerPath = `${storagePath}/creators/${context.req.user.id}/banner`
							if (!clear_banner_image && !!banner_image) {
								toSavePromises.push(
									new Promise(async (resolve, reject) => {
										try {
											await mkdir(bannerPath, { recursive: true })
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
								rimraf(bannerPath, () => {})
							}

							const logoPath = `${storagePath}/creators/${context.req.user.id}/logo`
							if (!clear_logo_image && !!logo_image) {
								toSavePromises.push(
									new Promise(async (resolve, reject) => {
										try {
											await mkdir(logoPath, { recursive: true })
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
								rimraf(logoPath, () => {})
							}

							await Promise.all(toSavePromises)

							const query = () => pgp.helpers.update(object, updateCreatorCS)
							try {
								const dbData = await db.none(query() + ` WHERE id = $1`, [context.req.user.id])
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
					throw errorName.UNAUTHORIZED
				}
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		uploadSingleOrZip: async (_parent, { file }, context, _info) => {
			try {
				if (await context.authenticate()) {
					return await new Promise((resolve, reject) => {
						tmp.dir({ prefix: 'theme' }, async (err, path, _cleanupCallback) => {
							try {
								if (err) {
									reject(err)
									return
								}

								const filePromises = saveFiles([{ file, path }])
								const files = await Promise.all(filePromises)

								// Create array of valid NXThemes
								let NXThemePaths = []
								if (await isYaz0Promisified(`${path}/${files[0]}`)) {
									NXThemePaths.push(`${path}/${files[0]}`)
								} else if (await isZipPromisified(`${path}/${files[0]}`)) {
									try {
										const zip = new AdmZip(`${path}/${files[0]}`)
										await zip.extractAllTo(`${path}/${files[0]}_extracted`)

										try {
											const filesInZip = await readdirPromisified(`${path}/${files[0]}_extracted`)
											const NXThemesInZip = await filterAsync(filesInZip, async (file) => {
												try {
													return await isYaz0Promisified(
														`${path}/${files[0]}_extracted/${file}`
													)
												} catch (e) {}
											})

											NXThemePaths = NXThemesInZip.map((file) => {
												return `${path}/${files[0]}_extracted/${file}`
											})
										} catch (e) {
											reject(errorName.ZIP_READ_ERROR)
											rimraf(path, () => {})
										}
									} catch (e) {
										reject(errorName.FILE_READ_ERROR)
										rimraf(path, () => {})
									}
								} else {
									reject(errorName.INVALID_FILE_TYPE)
									rimraf(path, () => {})
									return
								}

								if (NXThemePaths.length > 50) {
									reject(errorName.MAX_50_NXTHEMES)
									return
								}

								// Process all valid NXThemes
								if (NXThemePaths.length > 0) {
									const unpackPromises = unpackNXThemes(NXThemePaths)
									const unpackedPaths = await Promise.all(unpackPromises)

									const readThemePromises = unpackedPaths.map((path) => {
										return new Promise(async (resolve, reject) => {
											try {
												// Read info.json
												const info = JSON.parse(await readFile(`${path}/info.json`))

												// Read layout.json
												let layout = null
												try {
													layout = JSON.parse(await readFile(`${path}/layout.json`))
												} catch (e) {}

												// Check if image in dds or jpg format
												let image = false
												try {
													image = await access(
														`${path}/image.dds`,
														constants.R_OK | constants.W_OK
													)
													image = true
												} catch (e) {}
												try {
													image = await access(
														`${path}/image.jpg`,
														constants.R_OK | constants.W_OK
													)
													image = true
												} catch (e) {}

												// Only proceed if info and at least layout or image is detected
												if (info && (layout || image)) {
													// If the layout has an ID specified get the uuid
													let dbLayout = null
													if (layout && layout.ID) {
														const { service, id, piece_uuids } = parseThemeID(layout.ID)
														// Only fetch the layout if it was created by Themezer
														if (service === 'Themezer') {
															try {
																dbLayout = await db.one(
																	`
																		SELECT *, (
																				SELECT array_agg(row_to_json(p)) as used_pieces
																				FROM (
																					SELECT unnest(pieces) ->> 'name' as name, json_array_elements(unnest(pieces)->'values') as value
																					FROM layouts
																					WHERE id = hex_to_int('$1^')
																				) as p
																				WHERE value ->> 'uuid' = ANY($2::text[])
																			),
																			CASE WHEN commonlayout IS NULL THEN false ELSE true END AS has_commonlayout
																		FROM layouts
																		WHERE id = hex_to_int('$1^')
																	`,
																	[id, piece_uuids]
																)
															} catch (e) {
																console.error
																reject(errorName.INVALID_ID)
																return
															}
														}
													}

													let target = null
													if (validThemeTarget(info.Target)) {
														target = themeTargetToFileName(info.Target)
													} else {
														reject(errorName.INVALID_TARGET_NAME)
														return
													}

													// Return detected used_pieces separately
													let used_pieces = []
													if (dbLayout) {
														used_pieces = dbLayout.used_pieces
														delete dbLayout.used_pieces

														if (target !== dbLayout.target) {
															reject(errorName.TARGETS_DONT_MATCH)
															return
														}
													}

													resolve({
														info: info,
														tmp: encrypt(path),
														layout: dbLayout,
														used_pieces: used_pieces,
														target: target
													})
												} else {
													reject(errorName.INVALID_NXTHEME_CONTENTS)
													rimraf(path, () => {})
												}
											} catch (e) {
												console.error(e)
												reject(errorName.INVALID_NXTHEME_CONTENTS)
												rimraf(path, () => {})
											}
										})
									})

									// Execute all the NXTheme read promises
									const detectedThemes = await Promise.all(readThemePromises)

									if (detectedThemes && detectedThemes.length > 0) {
										resolve(detectedThemes)
									} else if (detectedThemes && detectedThemes.length === 0) {
										reject(errorName.NO_VALID_NXTHEMES)
										rimraf(path, () => {})
									} else {
										reject(errorName.FILE_READ_ERROR)
										rimraf(path, () => {})
									}
								} else {
									reject(errorName.NO_NXTHEMES_IN_ZIP)
									rimraf(path, () => {})
								}
							} catch (e) {
								console.error(e)
								reject(e)
								return
							}
						})
					})
				} else {
					throw errorName.UNAUTHORIZED
				}
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		submitThemes: async (_parent, { files, themes, details, type }, context, _info) => {
			let themePaths = []
			try {
				if (await context.authenticate()) {
					return await new Promise(async (resolve, reject) => {
						let insertedPack = null

						// Create array of screenshots to save
						const toSave = files.map((f, i) => {
							return new Promise((resolve, reject) => {
								const path = decrypt(themes[i].tmp)
								lstat(path, (err) => {
									if (err) {
										reject(errorName.INVALID_TMP)
										return
									}

									resolve({
										file: f,
										savename: 'screenshot',
										path: path
									})
								})
							})
						})
						const resolvedDecryptions = await Promise.all(toSave)

						// Save the screenshots
						const filePromises = saveFiles(resolvedDecryptions)
						const savedFiles = await Promise.all(filePromises)

						// If every theme has a screenshot
						if (savedFiles.length === themes.length) {
							const promises = savedFiles.map((file, i) => {
								return new Promise(async (resolve) => {
									const path = decrypt(themes[i].tmp)
									// If a valid jpeg
									if (await isJpegPromisified(`${path}/${file}`)) {
										resolve(path)
									}
								})
							})
							themePaths = await Promise.all(promises)

							// If all jpegs are valid
							if (themePaths.length === savedFiles.length) {
								// Insert pack into DB if user wants to and can submit as pack
								if (type === 'pack' && savedFiles.length > 1) {
									const packData = {
										last_updated: new Date(),
										creator_id: context.req.user.id,
										details: {
											name: details.name.trim(),
											description: details.description.trim(),
											color: details.color,
											version: details.version ? details.version.trim() : '1.0.0'
										}
									}

									const query = () => pgp.helpers.insert([packData], packsCS)
									try {
										insertedPack = await db.one(
											query() +
												` RETURNING id, int_to_padded_hex(id) as hex_id, details, last_updated, creator_id`
										)
									} catch (e) {
										console.error(e)
										reject(errorName.DB_SAVE_ERROR)
										return
									}
								}

								// Save NXTheme contents
								const themeDataPromises = themePaths.map((path, i) => {
									return new Promise(async (resolve, reject) => {
										let bgType = null

										try {
											// Read dir contents
											const filesInFolder = await readdirPromisified(path)
											// Filter allowed files, 'screenshot.jpg', not 'info.json', and not 'layout.json' if the layout is in the DB

											if (filesInFolder.includes('image.jpg')) {
												bgType = 'jpg'
											} else if (filesInFolder.includes('image.dds')) {
												bgType = 'dds'
											}
										} catch (e) {
											console.error(e)
											return
										}

										// TODO: Reject if any of the values is too long, match client limits

										// Reject if more than 10 categories
										if (themes[i].categories.length > 10) {
											reject(errorName.INVALID_CATEGORY_AMOUNT)
											return
										}

										// Process each category
										const categories = themes[i].categories.map((c) =>
											c.trim().replace(/(^\w{1})|(\s{1}\w{1})/g, (match) => match.toUpperCase())
										)

										// Add NSFW as category
										if (themes[i].nsfw) {
											categories.push('NSFW')
										}

										if (!validFileName(themes[i].target)) {
											reject(errorName.INVALID_TARGET_NAME)
											return ''
										}

										resolve({
											layout_id: themes[i].layout_id,
											piece_uuids:
												themes[i].used_pieces && themes[i].used_pieces.length > 0
													? themes[i].used_pieces.map((p) => p.value.uuid)
													: null,
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
												version: details.version
													? details.version.trim()
													: themes[i].version
													? themes[i].version.trim()
													: '1.0.0'
											},
											bg_type: bgType
										})
									})
								})
								const themeDatas = await Promise.all(themeDataPromises)

								// Insert themes into DB
								const query = () => pgp.helpers.insert(themeDatas, themesCS)
								try {
									const insertedThemes = await db.any(
										query() +
											` RETURNING id, int_to_padded_hex(id) as hex_id, details, last_updated, creator_id, target`
									)

									const themeMovePromises = themePaths.map((path, i) => {
										return new Promise(async (resolve, reject) => {
											try {
												// Read dir contents
												const filesInFolder = await readdirPromisified(path)
												// Filter allowed files, 'screenshot.jpg', not 'info.json', and not 'layout.json' if the layout is in the DB
												const filteredFilesInFolder = filesInFolder.filter(
													(f) =>
														(allowedFilesInNXTheme.includes(f) &&
															f !== 'info.json' &&
															!(f === 'layout.json' && themes[i].layout_id)) ||
														f === 'screenshot.jpg'
												)

												// Move NXTheme contents to cdn
												const moveAllPromises = filteredFilesInFolder.map((f) => {
													return moveFile(
														`${path}/${f}`,
														`${storagePath}/themes/${insertedThemes[i].hex_id}/${f}`
													)
												})
												await Promise.all(moveAllPromises)

												resolve(true)
											} catch (e) {
												console.error(e)
												reject(errorName.FILE_SAVE_ERROR)
												return
											}
										})
									})

									await Promise.all(themeMovePromises)

									resolve(true)

									if (type === 'pack') {
										const newPackMessage = packMessage

										newPackMessage
											.setTitle(insertedPack.details.name)
											.setAuthor(
												context.req.user.discord_user.username,
												avatar(context.req.user.id, context.req.user.discord_user) + '?size=64',
												`https://themezer.ga/creators/${context.req.user.id}`
											)
											.addField(
												'Themes in this pack:',
												themeDatas.map((t: any) => t.details.name).join('\n')
											)
											.setThumbnail(
												`${process.env.API_ENDPOINT}cdn/themes/${
													(themeDatas[0] as any).hex_id
												}/screenshot.jpg`
											)
											.setURL(
												`https://themezer.ga/packs/${insertedPack.details.name.replace(
													urlNameREGEX,
													'-'
												)}-${insertedPack.hex_id}`
											)

										if (insertedPack.details.description) {
											newPackMessage.setDescription(insertedPack.details.description)
										}

										Hook.send(newPackMessage)
									} else {
										insertedThemes.forEach((t: any) => {
											const newThemeMessage = themeMessage
											newThemeMessage
												.setTitle(t.details.name)
												.setAuthor(
													context.req.user.discord_user.username,
													avatar(context.req.user.id, context.req.user.discord_user) +
														'?size=64',
													`https://themezer.ga/creators/${context.req.user.id}`
												)
												.setThumbnail(
													`${process.env.API_ENDPOINT}cdn/themes/${t.hex_id}/screenshot.jpg`
												)
												.setURL(
													`https://themezer.ga/themes/${fileNameToWebName(
														t.target
													)}/${t.details.name.replace(urlNameREGEX, '-')}-${t.hex_id}`
												)

											if (t.details.description) {
												newThemeMessage.setDescription(t.details.description)
											}

											Hook.send(newThemeMessage)
										})
									}

									for (const i in themePaths) {
										rimraf(themePaths[i], () => {})
									}
								} catch (e) {
									console.error(e)
									reject(errorName.DB_SAVE_ERROR)
								}
							} else {
								reject(errorName.INVALID_FILE_TYPE)
							}
						} else {
							reject(errorName.FILE_SAVE_ERROR)
						}
					})
				} else {
					throw errorName.UNAUTHORIZED
				}
			} catch (e) {
				console.error(e)
				for (const i in themePaths) {
					rimraf(themePaths[i], () => {})
				}
				throw new Error(e)
			}
		},
		setLike: async (_parent, { type, id, value }, context, _info) => {
			try {
				const typeLowercase = type.toLowerCase()
				if (!['creators', 'layouts', 'themes', 'packs'].includes(typeLowercase))
					throw new Error(errorName.INVALID_FIELD)

				if (await context.authenticate()) {
					return await new Promise(async (resolve, reject) => {
						let dbData = null

						if (value === true) {
							// Add like
							dbData = await db.none(
								`
									UPDATE creators
										SET liked_${typeLowercase} = array_append(liked_${typeLowercase}, $2)
									WHERE id = $1
										AND (liked_${typeLowercase} IS NULL OR NOT $2 = ANY(liked_${typeLowercase}))
								`,
								[context.req.user.id, id]
							)
						} else {
							// Remove like
							dbData = await db.none(
								`
									UPDATE creators
										SET liked_${typeLowercase} = array_remove(liked_${typeLowercase}, $2)
									WHERE id = $1
										AND liked_${typeLowercase} IS NOT NULL
										AND $2 = ANY(liked_${typeLowercase})
								`,
								[context.req.user.id, id]
							)
						}

						resolve(true)
					})
				} else {
					throw errorName.UNAUTHORIZED
				}
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		}
	}
}
