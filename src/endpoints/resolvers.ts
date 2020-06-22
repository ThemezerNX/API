const util = require('util')
import { pgp, db } from '../db/db'
import {
	webNameToFileNameNoExtension,
	fileNameToThemeTarget,
	themeTargetToFileName,
	fileNameToWebName,
	validFileName
} from '../util/targetParser'
import { errorName } from '../util/errorTypes'

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
	readFile,
	writeFile,
	readdir,
	lstat,
	promises: { mkdir, access },
	constants
} = require('fs')
const writeFilePromisified = util.promisify(writeFile)
const readFilePromisified = util.promisify(readFile)
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
const storagePath = `${__dirname}/../../../storage`

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
		{ name: 'uuid', cast: 'uuid' },
		{ name: 'layout_uuid', cast: 'uuid' },
		{ name: 'piece_uuids', cast: 'uuid[]' },
		'target',
		{ name: 'last_updated', cast: 'timestamp without time zone' },
		{ name: 'categories', cast: 'character varying[]' },
		{ name: 'pack_uuid', cast: 'uuid' },
		{ name: 'creator_id', cast: 'character varying' },
		{ name: 'details', cast: 'json' },
		{ name: 'bg_type', cast: 'character varying (3)' }
	],
	{
		table: 'themes'
	}
)

const packsCS = new pgp.helpers.ColumnSet(
	[
		{ name: 'uuid', cast: 'uuid' },
		{ name: 'last_updated', cast: 'timestamp without time zone' },
		{ name: 'creator_id', cast: 'character varying' },
		{ name: 'details', cast: 'json' }
	],
	{
		table: 'packs'
	}
)

const creatorsCS = new pgp.helpers.ColumnSet(
	[
		{ name: 'role', cast: 'character varying' },
		{ name: 'bio', cast: 'character varying' },
		{ name: 'joined', cast: 'timestamp without time zone' },
		{ name: 'discord_user', cast: 'json' },
		{ name: 'id', cast: 'character varying' },
		{ name: 'banner_image', cast: 'character varying' },
		{ name: 'logo_image', cast: 'character varying' },
		{ name: 'profile_color', cast: 'character varying' }
	],
	{
		table: 'creators'
	}
)

const updateCreatorCS = new pgp.helpers.ColumnSet(
	[str('role'), str('bio'), str('banner_image'), str('logo_image'), str('profile_color')],
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

const mergeJson = async (uuid, piece_uuids = [], common?) => {
	let dbData = null

	// If common layout, dont get the pieces
	if (common) {
		dbData = await db.oneOrNone(
			`
			SELECT commonlayout
			FROM layouts
			WHERE uuid = $1
			LIMIT 1
		`,
			[uuid]
		)
	} else {
		dbData = await db.oneOrNone(
			`
			SELECT baselayout,
				(
					SELECT array_agg(row_to_json(pcs)) AS pieces
					FROM (
						SELECT unnest(pieces) ->> 'name' as name, json_array_elements(unnest(pieces)->'values') as value
						FROM layouts
						WHERE uuid = mt.uuid
					) as pcs
					WHERE value ->> 'uuid' = ANY($2::text[])
				)
	
			FROM layouts as mt
			WHERE mt.uuid = $1
			LIMIT 1
		`,
			[uuid, piece_uuids]
		)
	}

	if (dbData) {
		// Create an array with all used pieces
		const usedPieces = []
		for (const i in dbData.pieces) {
			usedPieces.push({
				uuid: dbData.pieces[i].value.uuid,
				json: dbData.pieces[i].value.json
			})
		}

		const baseJsonParsed = common ? JSON.parse(dbData.commonlayout) : JSON.parse(dbData.baselayout)
		if (baseJsonParsed) {
			while (usedPieces.length > 0) {
				const shifted = usedPieces.shift()

				// Merge files patches
				if (Array.isArray(baseJsonParsed.Files)) {
					baseJsonParsed.Files = patch(baseJsonParsed.Files, JSON.parse(shifted.json).Files, [
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
				if (Array.isArray(baseJsonParsed.Anims)) {
					baseJsonParsed.Anims = patch(baseJsonParsed.Anims, JSON.parse(shifted.json).Anims, ['FileName'])
				}
			}

			// Recreate the file layout
			const ordered = {
				PatchName: baseJsonParsed.PatchName,
				AuthorName: baseJsonParsed.AuthorName,
				TargetName: baseJsonParsed.TargetName,
				ID: stringifyThemeID({
					service: 'Themezer',
					uuid: uuid + (baseJsonParsed.TargetName === 'common.szs' ? '-common' : ''),
					piece_uuids: usedPieces.map((p) => p.uuid)
				}),
				Ready8X: baseJsonParsed.Ready8X,
				Files: baseJsonParsed.Files,
				Anims: baseJsonParsed.Anims
			}

			// Return as prettified string
			return JSON.stringify(ordered, null, 2)
		} else return null
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
						layoutDetails = JSON.parse(await readFilePromisified(`${theme.path}/layout.json`, 'utf8'))
					}

					// Create info preferably with the one in the layout or the specified target
					const info = createInfo(
						theme.themeName,
						theme.creatorName,
						fileNameToThemeTarget(layoutDetails ? layoutDetails.TargetName : theme.targetName),
						layoutDetails
					)

					// Write the info.json to the dir
					await writeFilePromisified(`${theme.path}/info.json`, JSON.stringify(info), 'utf8')

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
							filename:
								`${theme.themeName} by ${info.Author}` +
								(info.LayoutInfo ? ` using ${info.LayoutInfo}` : '') +
								'.nxtheme',
							data: await readFilePromisified(`${theme.path}/theme.nxtheme`, 'base64'),
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

const prepareNXTheme = (uuid, piece_uuids) => {
	return new Promise((resolve, reject) => {
		tmp.dir({ unsafeCleanup: true }, async (err, path, cleanupCallback) => {
			if (err) {
				reject(err)
				return
			}

			try {
				// Get the theme details
				const { layout_uuid, name, target, creator_name } = await db.oneOrNone(
					`
						SELECT layout_uuid, details ->> 'name' as name, target, 
							(
								SELECT discord_user ->> 'username'
								FROM creators
								WHERE id = themes.creator_id
								LIMIT 1
							) as username
						FROM themes
						WHERE uuid = $1
						LIMIT 1
					`,
					[uuid]
				)

				// Get merged layout json if any
				let layoutJson = null
				if (layout_uuid) {
					const layoutJson = await mergeJson(layout_uuid, piece_uuids)
					await writeFilePromisified(`${path}/layout.json`, layoutJson, 'utf8')
				}

				// Get optional common json
				let commonJson = null
				if (layout_uuid) {
					commonJson = await mergeJson(layout_uuid, null, true)
					if (commonJson) {
						await writeFilePromisified(`${path}/common.json`, commonJson, 'utf8')
					}
				}

				// Symlink all other allowedFilesInNXTheme
				const filesInFolder = await readdirPromisified(`${storagePath}/themes/${uuid}`)
				const linkAllPromises = filesInFolder.map((file) => {
					if (file !== 'screenshot.jpg') {
						return link(`${storagePath}/themes/${uuid}/${file}`, `${path}/${file}`)
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
				const themesB64 = await Promise.all(themePromises)

				resolve(themesB64[0])

				// Increase download count by 1
				db.none(
					`
						UPDATE themes
							SET dl_count = dl_count + 1
						WHERE uuid = $1
					`,
					[uuid]
				)

				cleanupCallback()
			} catch (e) {
				console.error(e)
				reject(errorName.NXTHEME_CREATE_FAILED)
				cleanupCallback()
			}
		})
	})
}

export default {
	JSON: GraphQLJSON,
	Query: {
		me: async (parent, args, context, info) => {
			if (await context.authenticate()) {
				return context.req.user
			} else {
				throw new Error(errorName.UNAUTHORIZED)
			}
		},
		creator: async (parent, { id }, context, info) => {
			try {
				const dbData = await db.one(
					`
					SELECT *
					FROM creators
					WHERE id = $1
					LIMIT 1
				`,
					[id]
				)

				return dbData
			} catch (e) {
				throw new Error(errorName.CREATOR_NOT_EXIST)
			}
		},
		categories: async (parent, args, context, info) => {
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
		layout: async (parent, { id, target }, context, info) => {
			try {
				const dbData = await db.oneOrNone(
					`
						SELECT uuid, details, baselayout, target, last_updated, pieces, commonlayout, id, dl_count,
							CASE WHEN (cardinality(pieces) > 0) THEN true ELSE false END AS has_pieces,
							CASE WHEN commonlayout IS NULL THEN false ELSE true END AS has_commonlayout,
							(
								SELECT row_to_json(c) as creator
								FROM (
									SELECT *
									FROM creators
									WHERE id = layouts.creator_id
									LIMIT 1
								) c
							)
						FROM layouts
						WHERE id = $1
							AND target = $2
						LIMIT 1
					`,
					[id, target]
				)

				return dbData
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		layoutsList: async (parent, { target, creator_id }, context, info) => {
			try {
				const dbData = await db.any(
					`
						SELECT uuid, details, baselayout, target, last_updated, pieces, commonlayout, id, dl_count,
							CASE WHEN (cardinality(pieces) > 0) THEN true ELSE false END AS has_pieces,
							CASE WHEN commonlayout IS NULL THEN false ELSE true END AS has_commonlayout,
							(
								SELECT row_to_json(c) as creator
								FROM (
									SELECT *
									FROM creators
									WHERE id = layouts.creator_id
									LIMIT 1
								) c
							)
						FROM layouts
						WHERE CASE WHEN $1 IS NOT NULL THEN target = $1 ELSE true END
							AND CASE WHEN $2 IS NOT NULL THEN creator_id = $2 ELSE true END
						ORDER BY last_updated DESC
					`,
					[target, creator_id]
				)

				return dbData
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		theme: async (parent, { id, target }, context, info) => {
			try {
				const dbData = await db.oneOrNone(
					`
						SELECT uuid, target, last_updated, categories, details, id, dl_count, bg_type,
							(
								SELECT row_to_json(c) as creator
								FROM (
									SELECT *
									FROM creators
									WHERE id = mt.creator_id
									LIMIT 1
								) c
							),
							(
								SELECT row_to_json(l) AS layout
								FROM (
									SELECT layouts.uuid, layouts.details, layouts.baselayout, layouts.target, layouts.last_updated, layouts.pieces, layouts.commonlayout, layouts.id, layouts.dl_count,
										CASE WHEN commonlayout IS NULL THEN false ELSE true END AS has_commonlayout,
										(
											SELECT row_to_json(c) as creator
											FROM (
												SELECT *
												FROM creators
												WHERE id = layouts.creator_id
												LIMIT 1
											) c
										)
									FROM themes as st
									INNER JOIN layouts
									ON layouts.uuid = st.layout_uuid
									WHERE st.uuid = mt.uuid
									GROUP BY layouts.uuid
								) as l
							),
							(
								SELECT row_to_json(p) AS pack
								FROM (
									SELECT packs.uuid, packs.last_updated, packs.details, packs.id, packs.dl_count,
										(
											SELECT row_to_json(c) as creator
											FROM (
												SELECT *
												FROM creators
												WHERE id = packs.creator_id
												LIMIT 1
											) c
										)
									FROM themes as st
									INNER JOIN packs
									ON packs.uuid = st.pack_uuid
									WHERE st.uuid = mt.uuid
									GROUP BY packs.uuid
								) as p
							),
							(
								SELECT array_agg(row_to_json(pcs)) AS pieces
								FROM (
									SELECT unnest(pieces) ->> 'name' as name, json_array_elements(unnest(pieces)->'values') as value
									FROM layouts
									WHERE uuid = mt.layout_uuid
								) as pcs
								WHERE value ->> 'uuid' = ANY(mt.piece_uuids::text[])
							)

						FROM themes as mt
						WHERE target = $2
							AND mt.id = $1
						LIMIT 1
					`,
					[id, target]
				)
				return dbData
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		themesList: async (parent, { target, creator_id, limit }, context, info) => {
			try {
				const dbData = await db.any(
					`
						SELECT uuid, target, last_updated, categories, details, id, dl_count, bg_type,
							(
								SELECT row_to_json(c) as creator
								FROM (
									SELECT *
									FROM creators
									WHERE id = mt.creator_id
									LIMIT 1
								) c
							),
							(
								SELECT row_to_json(l) AS layout
								FROM (
									SELECT layouts.uuid, layouts.details, layouts.baselayout, layouts.target, layouts.last_updated, layouts.pieces, layouts.commonlayout, layouts.id, layouts.dl_count,
										CASE WHEN commonlayout IS NULL THEN false ELSE true END AS has_commonlayout,
										(
											SELECT row_to_json(c) as creator
											FROM (
												SELECT *
												FROM creators
												WHERE id = layouts.creator_id
												LIMIT 1
											) c
										)
									FROM themes as st
									INNER JOIN layouts
									ON layouts.uuid = st.layout_uuid
									WHERE st.uuid = mt.uuid
									GROUP BY layouts.uuid
								) as l
							),
							(
								SELECT row_to_json(p) AS pack
								FROM (
									SELECT packs.uuid, packs.last_updated, packs.details, packs.id, packs.dl_count,
										(
											SELECT row_to_json(c) as creator
											FROM (
												SELECT *
												FROM creators
												WHERE id = packs.creator_id
												LIMIT 1
											) c
										)
									FROM themes as st
									INNER JOIN packs
									ON packs.uuid = st.pack_uuid
									WHERE st.uuid = mt.uuid
									GROUP BY packs.uuid
								) as p
							),
							(
								SELECT array_agg(row_to_json(pcs)) AS pieces
								FROM (
									SELECT unnest(pieces) ->> 'name' as name, json_array_elements(unnest(pieces)->'values') as value
									FROM layouts
									WHERE uuid = mt.layout_uuid
								) as pcs
								WHERE value ->> 'uuid' = ANY(mt.piece_uuids::text[])
							)

						FROM themes mt
						WHERE CASE WHEN $1 IS NOT NULL THEN target = $1 ELSE true END
							AND CASE WHEN $2 IS NOT NULL THEN creator_id = $2 ELSE true END
						ORDER BY last_updated DESC
						LIMIT CASE WHEN $3 IS NOT NULL THEN $3 END
					`,
					[target, creator_id, limit]
				)
				return dbData
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		pack: async (parent, { id }, context, info) => {
			try {
				const dbData = await db.oneOrNone(
					`
						SELECT uuid, last_updated, details, id, dl_count,
							(
								SELECT row_to_json(c) as creator
								FROM (
									SELECT *
									FROM creators
									WHERE id = pck.creator_id
									LIMIT 1
								) c
							),
							(
								SELECT array_agg(c) as categories
								FROM (
									SELECT DISTINCT UNNEST(categories)
									FROM themes
									WHERE pack_uuid = pck.uuid
								) as t(c)
							),
							(
								SELECT array_agg(row_to_json(theme))
								FROM (
									SELECT uuid, details, target, last_updated, categories, id, dl_count,
										(
											SELECT row_to_json(c) as creator
											FROM (
												SELECT *
												FROM creators
												WHERE id = mt.creator_id
												LIMIT 1
											) c
										),
										(
											SELECT row_to_json(l) AS layout
											FROM (
												SELECT layouts.uuid, layouts.details, layouts.baselayout, layouts.target, layouts.last_updated, layouts.pieces, layouts.commonlayout, layouts.id, layouts.dl_count,
													CASE WHEN commonlayout IS NULL THEN false ELSE true END AS has_commonlayout,
													(
														SELECT row_to_json(c) as creator
														FROM (
															SELECT *
															FROM creators
															WHERE id = layouts.creator_id
															LIMIT 1
														) c
													)
												FROM themes
												INNER JOIN layouts
												ON layouts.uuid = themes.layout_uuid
												WHERE themes.uuid = mt.uuid
												GROUP BY layouts.uuid
											) as l
										),
										(
											SELECT array_agg(row_to_json(pcs)) AS pieces
											FROM (
												SELECT unnest(pieces) ->> 'name' as name, json_array_elements(unnest(pieces)->'values') as value
												FROM layouts
												WHERE uuid = mt.layout_uuid
											) as pcs
											WHERE value ->> 'uuid' = ANY(mt.piece_uuids::text[])
										)
									FROM themes mt
									WHERE mt.pack_uuid = pck.uuid
								) as theme
							) as themes
						FROM packs pck
						WHERE id = $1
						LIMIT 1
					`,
					[id]
				)
				return dbData
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		packsList: async (parent, { creator_id, limit }, context, info) => {
			try {
				const dbData = await db.any(
					`
					SELECT uuid, last_updated, details, id, dl_count,
						(
							SELECT row_to_json(c) as creator
							FROM (
								SELECT *
								FROM creators
								WHERE id = pck.creator_id
								LIMIT 1
							) c
						),
						(
							SELECT array_agg(c) as categories
							FROM (
								SELECT DISTINCT UNNEST(categories)
								FROM themes
								WHERE pack_uuid = pck.uuid
							) as t(c)
						),
						(
							SELECT array_agg(row_to_json(theme))
							FROM (
								SELECT uuid, details, target, last_updated, categories, id, dl_count,
									(
										SELECT row_to_json(c) as creator
										FROM (
											SELECT *
											FROM creators
											WHERE id = mt.creator_id
											LIMIT 1
										) c
									),
									(
										SELECT row_to_json(l) AS layout
										FROM (
											SELECT layouts.uuid, layouts.details, layouts.baselayout, layouts.target, layouts.last_updated, layouts.pieces, layouts.commonlayout, layouts.id, layouts.dl_count,
												CASE WHEN commonlayout IS NULL THEN false ELSE true END AS has_commonlayout,
												(
													SELECT row_to_json(c) as creator
													FROM (
														SELECT *
														FROM creators
														WHERE id = layouts.creator_id
														LIMIT 1
													) c
												)
											FROM themes
											INNER JOIN layouts
											ON layouts.uuid = themes.layout_uuid
											WHERE themes.uuid = mt.uuid
											GROUP BY layouts.uuid
										) as l
									),
									(
										SELECT array_agg(row_to_json(pcs)) AS pieces
										FROM (
											SELECT unnest(pieces) ->> 'name' as name, json_array_elements(unnest(pieces)->'values') as value
											FROM layouts
											WHERE uuid = mt.layout_uuid
										) as pcs
										WHERE value ->> 'uuid' = ANY(mt.piece_uuids::text[])
									)
								FROM themes mt
								WHERE mt.pack_uuid = pck.uuid
							) as theme
						) as themes
					FROM packs pck

					WHERE CASE WHEN $1 IS NOT NULL THEN creator_id = $1 ELSE true END
					ORDER BY last_updated DESC
					LIMIT CASE WHEN $2 IS NOT NULL THEN $2 END
					`,
					[creator_id, limit]
				)
				return dbData
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		}
	},
	Mutation: {
		updateAuth: async (parent, params, context, info) => {
			try {
				if (await context.authenticate()) {
					return true
				} else {
					throw errorName.UNAUTHORIZED
				}
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		profile: async (
			parent,
			{ bio, profile_color, banner_image, logo_image, clear_banner_image, clear_logo_image },
			context,
			info
		) => {
			try {
				if (await context.authenticate()) {
					return await new Promise(async (resolve, reject) => {
						try {
							let object: any = {}

							if (bio) object.bio = bio
							if (profile_color) object.profile_color = profile_color

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
																savename: 'banner',
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
																savename: 'logo',
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
								const dbData = await db.none(
									query() +
										` WHERE id = $1
										`,
									[context.req.user.id]
								)
								resolve(true)
							} catch (e) {
								console.error(e)
								reject(errorName.DB_SAVE_ERROR)
								return
							}
						} catch (e) {
							console.error(e)
							reject(errorName.FILE_SAVE_ERROR)
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
		mergeJson: async (parent, { uuid, piece_uuids, common }, context, info) => {
			try {
				return await new Promise(async (resolve, reject) => {
					const json = await mergeJson(uuid, piece_uuids, common)
					resolve(json)

					// Increase download count by 1
					db.none(
						`
							UPDATE layouts
								SET dl_count = dl_count + 1
							WHERE uuid = $1
						`,
						[uuid]
					)
				})
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		createOverlaysNXTheme: async (parent, { layout }, context, info) => {
			try {
				return await new Promise((resolve, reject) => {
					tmp.dir({ unsafeCleanup: true }, async (err, path, cleanupCallback) => {
						if (err) {
							reject(err)
							return
						}

						try {
							const filePromises = saveFiles([{ file: layout, path }])
							const files = await Promise.all(filePromises)

							// Symlink the files to the two dirs
							await Promise.all([
								link(`${path}/${files[0]}`, `${path}/black/layout.json`),
								link(`${__dirname}/../../images/BLACK.dds`, `${path}/black/image.dds`),
								link(`${path}/${files[0]}`, `${path}/white/layout.json`),
								link(`${__dirname}/../../images/WHITE.dds`, `${path}/white/image.dds`)
							])

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
							const themesB64 = await Promise.all(themePromises)

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

		createOverlay: async (parent, { themeName, blackImg, whiteImg }, context, info) => {
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
							async function(err, stdout, stderr) {
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
										data: await readFilePromisified(`${path}/overlay.png`, 'base64'),
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
		},
		uploadSingleOrZip: async (parent, { file }, context, info) => {
			try {
				if (await context.authenticate()) {
					return await new Promise((resolve, reject) => {
						tmp.dir({ prefix: 'theme' }, async (err, path, cleanupCallback) => {
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

								// Process all valid NXThemes
								if (NXThemePaths.length > 0) {
									const unpackPromises = unpackNXThemes(NXThemePaths)
									const unpackedPaths = await Promise.all(unpackPromises)

									const readThemePromises = unpackedPaths.map((path) => {
										return new Promise(async (resolve, reject) => {
											try {
												// Read info.json
												const info = JSON.parse(await readFilePromisified(`${path}/info.json`))

												// Read layout.json
												let layout = null
												try {
													layout = JSON.parse(
														await readFilePromisified(`${path}/layout.json`)
													)
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
														const { service, uuid, piece_uuids } = parseThemeID(layout.ID)
														// Only fetch the layout if it was created by Themezer
														if (service === 'Themezer') {
															dbLayout = await db.oneOrNone(
																`
																	SELECT *, (
																			SELECT array_agg(row_to_json(p)) as used_pieces
																			FROM (
																				SELECT unnest(pieces) ->> 'name' as name, json_array_elements(unnest(pieces)->'values') as value
																				FROM layouts
																				WHERE uuid = $1
																			) as p
																			WHERE value ->> 'uuid' = ANY($2::text[])
																		),
																		CASE WHEN commonlayout IS NULL THEN false ELSE true END AS has_commonlayout
																	FROM layouts
																	WHERE uuid = $1
																`,
																[uuid, piece_uuids]
															)
														}
													}

													// Return detected used_pieces separately
													let used_pieces = []
													if (dbLayout) {
														used_pieces = dbLayout.used_pieces
														delete dbLayout.used_pieces
													}

													resolve({
														info: info,
														tmp: encrypt(path),
														layout: dbLayout,
														used_pieces: used_pieces,
														target: themeTargetToFileName(info.Target)
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
		submitThemes: async (parent, { files, themes, details, type }, context, info) => {
			let themePaths = []
			try {
				if (await context.authenticate()) {
					return await new Promise(async (resolve, reject) => {
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
								let packUuid = null
								if (type === 'pack' && savedFiles.length > 1) {
									packUuid = uuid()

									const packData = {
										uuid: packUuid,
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
										await db.none(query)
									} catch (e) {
										console.error(e)
										reject(errorName.DB_SAVE_ERROR)
										return
									}
								}

								// Save NXTheme contents
								const themeDataPromises = themePaths.map((path, i) => {
									return new Promise(async (resolve, reject) => {
										const themeUuid = uuid()
										let bgType = null

										try {
											// Read dir contents
											const filesInFolder = await readdirPromisified(path)
											// Filter allowed files, 'screenshot.jpg', not 'info.json', and not 'layout.json' if the layout is in the DB
											const filteredFilesInFolder = filesInFolder.filter(
												(f) =>
													(allowedFilesInNXTheme.includes(f) &&
														f !== 'info.json' &&
														!(f === 'layout.json' && themes[i].layout_uuid)) ||
													f === 'screenshot.jpg'
											)

											if (filteredFilesInFolder.includes('image.jpg')) {
												bgType = 'jpg'
											} else if (filteredFilesInFolder.includes('image.dds')) {
												bgType = 'dds'
											}

											// Move NXTheme contents to storage
											const moveAllPromises = filteredFilesInFolder.map((f) => {
												return moveFile(
													`${path}/${f}`,
													`${storagePath}/themes/${themeUuid}/${f}`
												)
											})
											await Promise.all(moveAllPromises)
										} catch (e) {
											console.error(e)
											reject(errorName.FILE_SAVE_ERROR)
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

										resolve({
											uuid: themeUuid,
											layout_uuid: themes[i].layout_uuid,
											piece_uuids:
												themes[i].used_pieces && themes[i].used_pieces.length > 0
													? themes[i].used_pieces.map((p) => p.value.uuid)
													: null,
											target: validFileName(themes[i].target)
												? themes[i].target
												: reject(errorName.INVALID_TARGET_NAME),
											last_updated: new Date(),
											categories: categories.sort(),
											pack_uuid: packUuid,
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
									await db.none(query)

									resolve(true)

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
		downloadTheme: async (parent, { uuid, piece_uuids }, context, info) => {
			try {
				return await new Promise(async (resolve, reject) => {
					try {
						const themePromise = await prepareNXTheme(uuid, piece_uuids)

						resolve(themePromise)
					} catch (e) {
						console.error(e)
						reject(errorName.NXTHEME_CREATE_FAILED)
					}
				})
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		downloadPack: async (parent, { uuid }, context, info) => {
			try {
				return await new Promise(async (resolve, reject) => {
					// Get the pack details and theme uuids
					let pack = null
					try {
						pack = await db.one(
							`
								SELECT details ->> 'name' as name,
									(
										SELECT discord_user ->> 'username'
										FROM creators
										WHERE id = pck.creator_id
										LIMIT 1
									) as creator_name
									(
										SELECT array_agg(uuid)
										FROM themes
										WHERE pack_uuid = pck.uuid
										LIMIT 1
									) as themes
								FROM packs pck
								WHERE uuid = $1
								LIMIT 1
							`,
							[uuid]
						)
					} catch (e) {
						console.error(e)
						reject(errorName.PACK_NOT_FOUND)
						return
					}

					try {
						// Create the NXThemes
						const themePromises = pack.themes.map((uuid) => prepareNXTheme(uuid, null))
						const themesB64: Array<any> = await Promise.all(themePromises)

						// Create zip from base64 buffers.
						// Use basic for loop to prevent 'MaxListenersExceededWarning' (I guess):
						const zip = new AdmZip()
						for (const i in themesB64) {
							try {
								await zip.addFile(themesB64[i].filename, Buffer.from(themesB64[i].data, 'base64'))
							} catch (e) {
								console.error(e)
								reject(errorName.PACK_CREATE_FAILED)
								return
							}
						}

						// Return zip data as Base64 encoded string
						const buff = await zip.toBuffer()
						resolve({
							filename: `${pack.name} by ${pack.creator_name}.zip`,
							data: buff.toString('base64'),
							mimetype: 'application/nxtheme'
						})

						// Increase download count by 1
						db.none(
							`
								UPDATE packs
									SET dl_count = dl_count + 1
								WHERE uuid = $1
							`,
							[uuid]
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
	}
}
