const graphqlFields = require('graphql-fields')
const path = require('path')
const util = require('util')
import { pgp, db } from '../db/db'
import {
	webNameToFileNameNoExtension,
	fileNameToThemeTarget,
	themeTargetToFileName,
	fileNameToWebName,
	validFileName
} from '../util/convertNames'
import { errorName } from '../util/errorTypes'

import { uuid } from 'uuidv4'
import { encrypt, decrypt } from '../util/crypt'
import { parseThemeID, stringifyThemeID } from '@themezernx/layout-id-parser'
import GraphQLJSON from 'graphql-type-json'
import { PythonShell } from 'python-shell'
import filterAsync from 'node-filter-async'
const link = require('fs-symlink')
const { createWriteStream, unlink, readFile, writeFile, readdir, lstat } = require('fs')
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
const extract = require('extract-zip')

const sarcToolPath = `${__dirname}/../../../SARC-Tool`
const storagePath = `${__dirname}/../../../storage`

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

const createNXThemes = (themes) =>
	themes.map(
		(theme) =>
			new Promise<Object>((resolve, reject) => {
				tmp.dir(async (err, path, cleanupCallback) => {
					try {
						if (err) {
							reject(err)
							return
						}

						if (!(theme.imagePath.endsWith('.dds') || theme.imagePath.endsWith('.DDS'))) {
							// Implement jpg to dds conversion
						}
						if (theme.imagePath) await link(theme.imagePath, `${path}/image.dds`)
						if (theme.layoutPath) await link(theme.layoutPath, `${path}/layout.json`)

						let layoutDetails = null
						let LayoutInfo = null
						if (theme.layoutPath) {
							layoutDetails = require(`${path}/layout.json`)
							LayoutInfo = `${layoutDetails.PatchName} by ${layoutDetails.AuthorName}`
						}

						const info = createInfo(
							theme.themeName,
							theme.author,
							fileNameToThemeTarget(theme.targetName) || fileNameToThemeTarget(layoutDetails.TargetName),
							layoutDetails
						)

						await writeFilePromisified(`${path}/info.json`, JSON.stringify(info), 'utf8')

						const options = {
							pythonPath: 'python3.8',
							scriptPath: sarcToolPath,
							args: ['-little', '-compress', '1', '-o', `${path}/theme.nxtheme`, path]
						}

						PythonShell.run('main.py', options, async function(err) {
							if (err) {
								reject(errorName.NXTHEME_CREATE_FAILED)
								rimraf(path, () => {})
								cleanupCallback()
								return
							}

							resolve({
								filename: `${theme.themeName} - ${LayoutInfo}.nxtheme`,
								data: await readFilePromisified(`${path}/theme.nxtheme`, 'base64'),
								mimetype: 'application/nxtheme'
							})
						})
					} catch (e) {
						reject(e)
						rimraf(path, () => {})
						cleanupCallback()
					}
				})
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
					SELECT uuid, details, target, last_updated, categories, id,
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

				if (dbData && dbData.layout) {
					dbData.layout.webtarget = fileNameToWebName(dbData.layout.target)
				}

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
					SELECT uuid, details, target, last_updated, categories, id,
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

				if (dbData && dbData.layout) {
					dbData.layout.webtarget = fileNameToWebName(dbData.layout.target)
				}

				return dbData
			} catch (e) {
				console.error(e)
				throw new Error(e)
			}
		}
	},
	Mutation: {
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

							const themes = [
								{
									imagePath: `${__dirname}/../../images/BLACK.dds`,
									layoutPath: `${path}/${files[0]}`,
									themeName: 'Black background'
								},
								{
									imagePath: `${__dirname}/../../images/WHITE.dds`,
									layoutPath: `${path}/${files[0]}`,
									themeName: 'White background'
								}
							]

							const themePromises = createNXThemes(themes)
							const themesB64 = await Promise.all(themePromises)

							resolve(themesB64)

							cleanupCallback()
						} catch (e) {
							// reject(e)
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
									await extract(`${path}/${files[0]}`, {
										dir: `${path}/${files[0]}_extracted`
									})

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

											let ddsImage = null
											try {
												ddsImage = JSON.parse(
													await readFilePromisified(`${path}/image.dds`, 'base64')
												)
											} catch (e) {}

											if (info && (layout || ddsImage)) {
												let dbLayout = null
												if (layout.ID) {
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

													dbLayout.webtarget = fileNameToWebName(dbLayout.target)
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
						let themePaths = []

						const promises = savedFiles.map((file, i) => {
							const path = decrypt(themes[i].tmp)
							return new Promise(async (resolve) => {
								if (await isJpegPromisified(`${path}/${file}`)) {
									resolve(`${path}`)
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
									rimraf(path, () => {})
									return
								}
							}

							// Move files to storage
							const themeDataPromises = themePaths.map((path, i) => {
								const themeUuid = uuid()
								return new Promise(async (resolve, reject) => {
									let hasImage = false
									try {
										await moveFile(
											`${path}/${savedFiles[i]}`,
											`${storagePath}/themes/${themeUuid}/screenshot.jpg`
										)
										await moveFile(
											`${path}/image.dds`,
											`${storagePath}/themes/${themeUuid}/image.dds`
										)
										hasImage = true
									} catch (e) {}
									resolve({
										uuid: themeUuid,
										layout_uuid: themes[i].layout_uuid,
										piece_uuids: themes[i].used_pieces.map((p) => p.value.uuid),
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
				throw new Error(e)
			}
		}
	}
}
