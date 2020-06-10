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
const { createWriteStream, unlink, readFile, writeFile, readdir, lstat, promises, constants } = require('fs')
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

const allowdFilesInNXTheme = [
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

const themesCS = new pgp.helpers.ColumnSet(
	[
		{ name: 'uuid', cast: 'uuid' },
		{ name: 'layout_uuid', cast: 'uuid' },
		{ name: 'piece_uuids', cast: 'uuid[]' },
		'target',
		{ name: 'last_updated', cast: 'timestamp without time zone' },
		{ name: 'categories', cast: 'character varying[]' },
		{ name: 'nsfw', cast: 'boolean' },
		{ name: 'pack_uuid', cast: 'uuid' },
		{ name: 'details', cast: 'json' }
	],
	{
		table: 'themes'
	}
)

const packsCS = new pgp.helpers.ColumnSet(
	[
		{ name: 'uuid', cast: 'uuid' },
		{ name: 'last_updated', cast: 'timestamp without time zone' },
		{ name: 'details', cast: 'json' }
	],
	{
		table: 'packs'
	}
)

const createInfo = (themeName, author, target, layoutDetails) => {
	let LayoutInfo = null
	if (layoutDetails) {
		LayoutInfo = `${layoutDetails.PatchName} by ${layoutDetails.AuthorName || 'Themezer'}`
	}
	return {
		Version: 12,
		ThemeName: themeName,
		Author: author || 'Themezer',
		Target: target,
		LayoutInfo
	}
}

const saveFiles = (files) =>
	files.map(
		({ file, savename, path }) =>
			new Promise<any>(async (resolve, reject) => {
				let { createReadStream, filename, mimetype } = await file
				const stream = createReadStream()

				const FILE_EXTENSION_REGEX = /\.[^\/.]+$/
				if (!FILE_EXTENSION_REGEX.test(filename)) {
					filename = `${savename || filename}.file`
				} else if (savename) {
					filename = savename + FILE_EXTENSION_REGEX.exec(filename)
				} else {
					filename = filename
				}

				const writeStream = createWriteStream(`${path}/${filename}`)

				writeStream.on('finish', () => {
					resolve(`${filename}`)
				})

				writeStream.on('error', (error) => {
					unlink(path, () => {
						if (error.message.includes('exceeds') && error.message.includes('size limit')) {
							reject(errorName.FILE_TOO_BIG)
						} else {
							reject(errorName.FILE_SAVE_ERROR)
						}
					})
				})

				stream.on('error', (error) => writeStream.destroy(error))

				stream.pipe(writeStream)
			})
	)

const mergeJson = async (uuid, piece_uuids = [], common?) => {
	let dbData = null
	if (common) {
		dbData = await db.oneOrNone(
			`
			SELECT uuid, details, target, commonlayout
			FROM layouts
			WHERE uuid = $1
		`,
			[uuid]
		)
	} else {
		dbData = await db.oneOrNone(
			`
			SELECT uuid, details, target, baselayout,
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
		`,
			[uuid, piece_uuids]
		)
	}

	if (dbData) {
		const array = []
		for (const i in dbData.pieces) {
			array.push({
				uuid: dbData.pieces[i].value.uuid,
				json: dbData.pieces[i].value.json
			})
		}

		const usedPieces = []
		const baseJsonParsed = common ? JSON.parse(dbData.commonlayout) : JSON.parse(dbData.baselayout)
		if (baseJsonParsed) {
			for (const piece in array) usedPieces.push(array[piece].uuid)

			const fArray = [].concat(array)
			while (fArray.length > 0) {
				const shifted = fArray.shift()
				baseJsonParsed.Files = patch(baseJsonParsed.Files || [], JSON.parse(shifted.json).Files, [
					'FileName',
					'PaneName',
					'PropName',
					'GroupName',
					'name',
					'MaterialName',
					'unknown'
				])
			}

			const aArray = [].concat(array)
			while (aArray.length > 0) {
				const shifted = aArray.shift()
				baseJsonParsed.Anims = patch(baseJsonParsed.Anims || [], JSON.parse(shifted.json).Anims, ['FileName'])
			}

			const ordered = {
				PatchName: baseJsonParsed.PatchName,
				AuthorName: baseJsonParsed.AuthorName,
				TargetName: baseJsonParsed.TargetName,
				ID: stringifyThemeID({
					service: 'Themezer',
					uuid: uuid + (baseJsonParsed.TargetName === 'common.szs' ? '-common' : ''),
					piece_uuids: usedPieces
				}),
				Ready8X: baseJsonParsed.Ready8X,
				Files: baseJsonParsed.Files,
				Anims: baseJsonParsed.Anims
			}

			return JSON.stringify(ordered, null, 2)
		} else return null
	} else return null
}

const createNXThemes = (themes) =>
	themes.map(
		(theme) =>
			new Promise<Object>(async (resolve, reject) => {
				try {
					const filesInFolder = await readdirPromisified(theme.path)

					let layoutDetails = null
					if (filesInFolder.includes('layout.json')) {
						layoutDetails = JSON.parse(await readFilePromisified(`${theme.path}/layout.json`, 'utf8'))
					}

					const info = createInfo(
						theme.themeName,
						theme.author,
						fileNameToThemeTarget(theme.targetName || layoutDetails.TargetName),
						layoutDetails
					)

					await writeFilePromisified(`${theme.path}/info.json`, JSON.stringify(info), 'utf8')

					const options = {
						pythonPath: 'python3.8',
						scriptPath: sarcToolPath,
						args: ['-little', '-compress', '1', '-o', `${theme.path}/theme.nxtheme`, theme.path]
					}

					PythonShell.run('main.py', options, async function(err) {
						if (err) {
							reject(errorName.NXTHEME_CREATE_FAILED)
							rimraf(theme.path, () => {})
							return
						}

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
					const options = {
						pythonPath: 'python3.8',
						scriptPath: sarcToolPath,
						args: [path]
					}

					PythonShell.run('main.py', options, async function(err) {
						if (err) {
							console.log(err)
							reject(errorName.NXTHEME_UNPACK_FAILED)
							return
						}

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
				const { layout_uuid, name, target, author } = await db.oneOrNone(
					`
						SELECT layout_uuid, details ->> 'name' as name, target, details -> 'author' ->> 'name' as author
						FROM themes
						WHERE uuid = $1
					`,
					[uuid]
				)

				// Get merged layout json if any, else link it in a bit
				let layoutJson = null
				if (layout_uuid) {
					const layoutJson = await mergeJson(layout_uuid, piece_uuids)
					await writeFilePromisified(`${path}/layout.json`, layoutJson, 'utf8')
				} else {
				}

				// Get optional common json
				let commonJson = null
				if (layout_uuid) {
					commonJson = await mergeJson(layout_uuid, null, true)
					if (commonJson) {
						await writeFilePromisified(`${path}/common.json`, commonJson, 'utf8')
					}
				}

				// Get all other optional files
				// https://github.com/exelix11/SwitchThemeInjector/blob/master/SwitchThemesCommon/PatchTemplate.cs#L10-L29

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
						author: author
					}
				]

				const themePromises = createNXThemes(themes)
				const themesB64 = await Promise.all(themePromises)

				resolve(themesB64[0])

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
				console.log(e)
				reject(errorName.NXTHEME_CREATE_FAILED)
				cleanupCallback()
			}
		})
	})
}

export default {
	JSON: GraphQLJSON,
	Query: {
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
					SELECT *,
						CASE WHEN (cardinality(pieces) > 0) THEN true ELSE false END AS has_pieces,
						CASE WHEN commonlayout IS NULL THEN false ELSE true END AS has_commonlayout
					FROM layouts
					WHERE id = $1
						AND target = $2
				`,
					[id, webNameToFileNameNoExtension(target)]
				)

				return dbData
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		layoutsList: async (parent, { target }, context, info) => {
			try {
				const dbData = await db.any(
					`
					SELECT *,
						CASE WHEN (cardinality(pieces) > 0) THEN true ELSE false END AS has_pieces,
						CASE WHEN commonlayout IS NULL THEN false ELSE true END AS has_commonlayout
					FROM layouts
					WHERE target = $1
				`,
					[webNameToFileNameNoExtension(target)]
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
					SELECT uuid, details, target, last_updated, categories, id, dl_count,
						CASE WHEN nsfw IS true THEN true ELSE false END AS nsfw,
						(
							SELECT row_to_json(l) AS layout
							FROM (
								SELECT layouts.*,
									CASE WHEN commonlayout IS NULL THEN false ELSE true END AS has_commonlayout
								FROM themes
								INNER JOIN layouts
								ON layouts.uuid = themes.layout_uuid
								WHERE themes.uuid = mt.uuid
								GROUP BY layouts.uuid
							) as l
						),
						(
							SELECT row_to_json(p) AS pack
							FROM (
								SELECT packs.*
								FROM themes
								INNER JOIN packs
								ON packs.uuid = themes.pack_uuid
								WHERE themes.uuid = mt.uuid
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
				`,
					[id, webNameToFileNameNoExtension(target)]
				)

				return dbData
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		themesList: async (parent, { target }, context, info) => {
			try {
				const dbData = await db.any(
					`
					SELECT uuid, details, target, last_updated, categories, id, dl_count,
						CASE WHEN nsfw IS true THEN true ELSE false END AS nsfw,
						(
							SELECT row_to_json(l) AS layout
							FROM (
								SELECT layouts.*,
									CASE WHEN commonlayout IS NULL THEN false ELSE true END AS has_commonlayout
								FROM themes
								INNER JOIN layouts
								ON layouts.uuid = themes.layout_uuid
								WHERE themes.uuid = mt.uuid
								GROUP BY layouts.uuid
							) as l
						),
						(
							SELECT row_to_json(p) AS pack
							FROM (
								SELECT packs.*
								FROM themes
								INNER JOIN packs
								ON packs.uuid = themes.pack_uuid
								WHERE themes.uuid = mt.uuid
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
					WHERE target = $1
				`,
					[webNameToFileNameNoExtension(target)]
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
					SELECT *, (
							SELECT array_agg(row_to_json(theme))
							FROM (
								SELECT uuid, details, target, last_updated, categories, id, dl_count,
									CASE WHEN nsfw IS true THEN true ELSE false END AS nsfw,
									(
										SELECT row_to_json(l) AS layout
										FROM (
											SELECT layouts.*,
												CASE WHEN commonlayout IS NULL THEN false ELSE true END AS has_commonlayout
											FROM themes
											INNER JOIN layouts
											ON layouts.uuid = themes.layout_uuid
											WHERE themes.uuid = mt.uuid
											GROUP BY layouts.uuid
										) as l
									),
									(
										SELECT row_to_json(p) AS pack
										FROM (
											SELECT packs.*
											FROM themes
											INNER JOIN packs
											ON packs.uuid = themes.pack_uuid
											WHERE themes.uuid = mt.uuid
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
								WHERE mt.pack_uuid = pck.uuid
							) as theme
						) as themes
					FROM packs pck
					WHERE id = $1
				`,
					[id]
				)

				return dbData
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		packsList: async (parent, params, context, info) => {
			try {
				const dbData = await db.any(
					`
					SELECT *, (
							SELECT array_agg(row_to_json(theme))
							FROM (
								SELECT uuid, details, target, last_updated, categories, id, dl_count,
									CASE WHEN nsfw IS true THEN true ELSE false END AS nsfw,
									(
										SELECT row_to_json(l) AS layout
										FROM (
											SELECT layouts.*,
												CASE WHEN commonlayout IS NULL THEN false ELSE true END AS has_commonlayout
											FROM themes
											INNER JOIN layouts
											ON layouts.uuid = themes.layout_uuid
											WHERE themes.uuid = mt.uuid
											GROUP BY layouts.uuid
										) as l
									),
									(
										SELECT row_to_json(p) AS pack
										FROM (
											SELECT packs.*
											FROM themes
											INNER JOIN packs
											ON packs.uuid = themes.pack_uuid
											WHERE themes.uuid = mt.uuid
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
								WHERE mt.pack_uuid = pck.uuid
							) as theme
						) as themes
					FROM packs pck
				`
				)

				return dbData
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		}
	},
	Mutation: {
		mergeJson: async (parent, { uuid, piece_uuids, common }, context, info) => {
			return await new Promise(async (resolve, reject) => {
				const json = await mergeJson(uuid, piece_uuids, common)
				resolve(json)
				db.none(
					`
					UPDATE layouts
						SET dl_count = dl_count + 1
					WHERE uuid = $1
				`,
					[uuid]
				)
			})
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

							await Promise.all([
								link(`${path}/${files[0]}`, `${path}/black/layout.json`),
								link(`${__dirname}/../../images/BLACK.dds`, `${path}/black/image.dds`),
								link(`${path}/${files[0]}`, `${path}/white/layout.json`),
								link(`${__dirname}/../../images/WHITE.dds`, `${path}/white/image.dds`)
							])

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
				return await new Promise((resolve, reject) => {
					tmp.dir({ prefix: 'theme' }, async (err, path, cleanupCallback) => {
						try {
							if (err) {
								reject(err)
								return
							}

							const filePromises = saveFiles([{ file, path }])
							const files = await Promise.all(filePromises)

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
												return await isYaz0Promisified(`${path}/${files[0]}_extracted/${file}`)
											} catch (e) {}
										})

										NXThemePaths = NXThemesInZip.map((file) => {
											return `${path}/${files[0]}_extracted/${file}`
										})
									} catch (e) {
										reject(errorName.ZIP_READ_ERROR)
										rimraf(path, () => {})
									}
								} catch (err) {
									reject(errorName.FILE_READ_ERROR)
									rimraf(path, () => {})
								}
							} else {
								reject(errorName.INVALID_FILE_TYPE)
								rimraf(path, () => {})
								return
							}

							if (NXThemePaths.length > 0) {
								const unpackPromises = unpackNXThemes(NXThemePaths)
								const unpackedPaths = await Promise.all(unpackPromises)

								const readThemePromises = unpackedPaths.map((path) => {
									return new Promise(async (resolve, reject) => {
										try {
											const info = JSON.parse(await readFilePromisified(`${path}/info.json`))

											let layout = null
											try {
												layout = JSON.parse(await readFilePromisified(`${path}/layout.json`))
											} catch (e) {}

											// Check if image in dds or jpg format
											let image = false
											try {
												image = await promises.access(
													`${path}/image.dds`,
													constants.R_OK | constants.W_OK
												)
												image = true
											} catch (e) {}
											try {
												image = await promises.access(
													`${path}/image.jpg`,
													constants.R_OK | constants.W_OK
												)
												image = true
											} catch (e) {}

											if (info && (layout || image)) {
												let dbLayout = null
												if (layout && layout.ID) {
													const { uuid, piece_uuids } = parseThemeID(layout.ID)

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

												let used_pieces = []
												let categoriesDB = null
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

								const detectedThemes = await Promise.all(readThemePromises)

								if (detectedThemes.length > 0) {
									resolve(detectedThemes)
								} else {
									reject(errorName.FILE_READ_ERROR)
									rimraf(path, () => {})
								}
							} else {
								reject(errorName.NO_NXTHEMES_IN_ZIP)
								rimraf(path, () => {})
							}
						} catch (e) {
							reject(e)
							return
						}
					})
				})
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		},
		submitThemes: async (parent, { files, themes, details, type }, context, info) => {
			let themePaths = []
			try {
				return await new Promise(async (resolve, reject) => {
					const toSave = files.map((f, i) => {
						return new Promise((resolve, reject) => {
							lstat(decrypt(themes[i].tmp), (err) => {
								if (err) {
									reject(errorName.INVALID_TMP)
									return
								}

								resolve({
									file: f,
									savename: 'screenshot',
									path: decrypt(themes[i].tmp)
								})
							})
						})
					})
					const resolvedDecryptions = await Promise.all(toSave)

					const filePromises = saveFiles(resolvedDecryptions)
					const savedFiles = await Promise.all(filePromises)

					if (savedFiles.length === themes.length) {
						const promises = savedFiles.map((file, i) => {
							const path = decrypt(themes[i].tmp)
							return new Promise(async (resolve) => {
								if (await isJpegPromisified(`${path}/${file}`)) {
									resolve(path)
								}
							})
						})

						themePaths = await Promise.all(promises)
						if (themePaths.length === savedFiles.length) {
							// Insert packs into DB
							let packUuid = null
							if (type === 'pack' && savedFiles.length > 1) {
								// User wants to and can submit as pack
								packUuid = uuid()
								const packData = {
									uuid: packUuid,
									last_updated: new Date(),
									details: {
										name: details.name.trim(),
										author: {
											name: details.author.name.trim(),
											discord_tag: details.author.discord_tag
										},
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

							// Move files to storage
							const themeDataPromises = themePaths.map((path, i) => {
								return new Promise(async (resolve, reject) => {
									const themeUuid = uuid()
									try {
										const filesInFolder = await readdirPromisified(path)
										const filteredFIlesInFolder = filesInFolder.filter(
											(f) => allowdFilesInNXTheme.includes(f) || f === 'screenshot.jpg'
										)
										const moveAllPromises = filteredFIlesInFolder.map((file) => {
											console.log(!(themes[i].layout_uuid && file === 'layout.json'))
											if (
												file !== 'info.json' &&
												!(themes[i].layout_uuid && file === 'layout.json')
											) {
												console.log('move:', themeUuid)
												return moveFile(
													`${path}/${file}`,
													`${storagePath}/themes/${themeUuid}/${file}`
												)
											} else return null
										})
										await Promise.all(moveAllPromises)
									} catch (e) {}

									console.log('resolve:', themeUuid)
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
										categories: themes[i].categories.map((c) => c.trim()),
										nsfw: themes[i].nsfw,
										pack_uuid: packUuid,
										details: {
											name: themes[i].info.ThemeName.trim(),
											author: {
												name:
													themes[i].info.Author && themes[i].info.Author.length > 0
														? themes[i].info.Author.trim()
														: themes[i].authorname.trim(),
												discord_tag: details.author.discord_tag
											},
											description: themes[i].description ? themes[i].description.trim() : null,
											color: themes[i].color,
											version: details.version
												? details.version.trim()
												: themes[i].version
												? themes[i].version.trim()
												: '1.0.0'
										}
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
						console.log(e)
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
					try {
						const themes = await db.any(
							`
							SELECT uuid
							FROM themes
							WHERE pack_uuid = $1
						`,
							[uuid]
						)

						const pack = await db.one(
							`
							SELECT details ->> 'name' as name, details -> 'author' ->> 'name' as author
							FROM packs
							WHERE uuid = $1
						`,
							[uuid]
						)

						const themePromises = themes.map(({ uuid }) => prepareNXTheme(uuid, null))
						const themesB64 = await Promise.all(themePromises)

						const zip = new AdmZip()
						const addPromises = themesB64.map(({ filename, data }) => {
							return new Promise(async (resolve, reject) => {
								try {
									await zip.addFile(filename, Buffer.from(data, 'base64'))
									resolve()
								} catch (e) {
									console.error(e)
									reject()
								}
							})
						})
						await Promise.all(addPromises)

						const buff = await zip.toBuffer()
						resolve({
							filename: `${pack.name} by ${pack.author}.zip`,
							data: buff.toString('base64'),
							mimetype: 'application/nxtheme'
						})

						db.none(
							`
								UPDATE packs
									SET dl_count = dl_count + 1
								WHERE uuid = $1
							`,
							[uuid]
						)
					} catch (e) {
						console.log(e)
						reject(errorName.NXTHEME_CREATE_FAILED)
					}
				})
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		}
	}
}
