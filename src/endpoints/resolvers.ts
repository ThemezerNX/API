const graphqlFields = require('graphql-fields')
const path = require('path')
const util = require('util')
import { pgp, db } from '../db/db'
import {
	webNameToFileNameNoExtension,
	fileNameToThemeTarget,
	themeTargetToFileName,
	fileNameToWebName
} from '../util/convertNames'

import { encrypt, decrypt } from '../util/crypt'
import { parseThemeID, stringifyThemeID } from '@themezernx/layout-id-parser'
import GraphQLJSON from 'graphql-type-json'
import { PythonShell } from 'python-shell'
import filterAsync from 'node-filter-async'
const link = require('fs-symlink')
const { createWriteStream, unlink, readFile, writeFile, readdir, rename } = require('fs')
const writeFilePromisified = util.promisify(writeFile)
const readFilePromisified = util.promisify(readFile)
const readdirPromisified = util.promisify(readdir)
const renamePromisified = util.promisify(rename)
var tmp = require('tmp')
const rimraf = require('rimraf')

var im = require('imagemagick')

var YAZ0_FILE = require('is-yaz0-file')
var ZIP_FILE = require('is-zip-file')
const isYaz0Promisified = util.promisify(YAZ0_FILE.isYaz0)
const isZipPromisified = util.promisify(ZIP_FILE.isZip)
const extract = require('extract-zip')

import { errorName } from '../util/errorTypes'

const sarcToolPath = `${__dirname}/../../../SARC-Tool`

const saveFiles = (files, path) =>
	files.map(
		(file) =>
			new Promise<String>(async (resolve, reject) => {
				let { createReadStream, filename, mimetype } = await file
				const stream = createReadStream()

				if (!/\.[^\/.]+$/.test(filename)) {
					filename = `${filename}.file`
				}

				// Create a stream to which the upload will be written.
				const writeStream = createWriteStream(`${path}/${filename}`)

				// When the upload is fully written, resolve the promise.
				writeStream.on('finish', () => {
					resolve(`${filename}`)
				})

				// If there's an error writing the file, remove the partially written file
				// and reject the promise.
				writeStream.on('error', (error) => {
					unlink(path, () => {
						reject(errorName.FILE_SAVE_ERROR)
						return
					})
				})

				// In node <= 13, errors are not automatically propagated between piped
				// streams. If there is an error receiving the upload, destroy the write
				// stream with the corresponding error.
				stream.on('error', (error) => writeStream.destroy(error))

				// Pipe the upload into the write stream.
				stream.pipe(writeStream)
			})
	)

const createNXThemes = (themes) =>
	themes.map(
		(theme) =>
			new Promise<Object>((resolve, reject) => {
				tmp.dir({ unsafeCleanup: true }, async function _tempDirCreated(err, path, cleanupCallback) {
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

						console.log(`${theme.themeName}: ${path}`)

						let layoutDetails = null
						let LayoutInfo = null
						if (theme.layoutPath) {
							layoutDetails = require(`${path}/layout.json`)
							LayoutInfo = `${layoutDetails.PatchName} by ${layoutDetails.AuthorName}`
						}

						const info = {
							Version: 12,
							ThemeName: theme.themeName,
							Author: theme.author || 'Themezer',
							Target:
								fileNameToThemeTarget(theme.targetName) ||
								fileNameToThemeTarget(layoutDetails.TargetName),
							LayoutInfo
						}

						await writeFilePromisified(`${path}/info.json`, JSON.stringify(info), 'utf8')

						const options = {
							pythonPath: 'python3.8',
							scriptPath: sarcToolPath,
							args: ['-little', '-compress', '1', '-o', `${path}/theme.nxtheme`, path]
						}

						PythonShell.run('main.py', options, async function(err) {
							if (err) {
								reject(errorName.NXTHEME_CREATE_FAILED)
								rimraf(`${path}/*`, () => {})
								return
							}

							resolve({
								filename: `${theme.themeName} - ${LayoutInfo}.nxtheme`,
								data: await readFilePromisified(`${path}/theme.nxtheme`, 'base64'),
								mimetype: 'application/nxtheme'
							})
						})

						cleanupCallback()
					} catch (e) {
						reject(e)
						rimraf(`${path}/*`, () => {})
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
		layout: async (parent, { name, target }, context, info) => {
			try {
				const dbData = await db.oneOrNone(
					`
					SELECT *,
					CASE WHEN (cardinality(pieces) > 0) THEN true ELSE false END AS has_pieces
					from layouts
					WHERE name = $1
						AND target = $2
				`,
					[name, webNameToFileNameNoExtension(target)]
				)

				return dbData
			} catch (e) {
				throw new Error(e)
			}
		},
		layoutsList: async (parent, { target }, context, info) => {
			try {
				const dbData = await db.any(
					`
					SELECT *,
					CASE WHEN (cardinality(pieces) > 0) THEN true ELSE false END AS has_pieces
					FROM layouts
					WHERE target = $1
				`,
					[webNameToFileNameNoExtension(target)]
				)

				return dbData
			} catch (e) {
				throw new Error(e)
			}
		}
	},
	Mutation: {
		createOverlaysNXTheme: async (parent, { layout }, context, info) => {
			try {
				return await new Promise((resolve, reject) => {
					tmp.dir({ unsafeCleanup: true }, async function _tempDirCreated(err, path, cleanupCallback) {
						if (err) {
							reject(err)
							return
						}

						try {
							const filePromises = saveFiles([layout], path)

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
							reject(e)
							rimraf(`${path}/*`, () => {})
						}
					})
				})
			} catch (e) {
				throw new Error(e)
			}
		},
		createOverlay: async (parent, { themeName, blackImg, whiteImg }, context, info) => {
			try {
				return await new Promise((resolve, reject) => {
					tmp.dir({ unsafeCleanup: true }, async function _tempDirCreated(err, path, cleanupCallback) {
						if (err) {
							reject(err)
							return
						}

						const filePromises = saveFiles([blackImg, whiteImg], path)

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
									rimraf(`${path}/*`, () => {})
									return
								} else {
									console.log(stdout)
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
				throw new Error(e)
			}
		},
		uploadSingleOrZip: async (parent, { file }, context, info) => {
			try {
				return await new Promise((resolve, reject) => {
					tmp.dir({ prefix: 'theme' }, async function _tempDirCreated(err, path, cleanupCallback) {
						if (err) {
							reject(err)
							return
						}

						const filePromises = saveFiles([file], path)

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
										} catch (e) {
											console.error(e)
										}
									})

									filesInZip.forEach((file) => {
										if (isYaz0Promisified(`${path}/${files[0]}_extracted/${file}`)) {
											NXThemePaths.push(`${path}/${files[0]}_extracted/${file}`)
										}
									})
								} catch (e) {
									reject(errorName.FILE_READ_ERROR)
									rimraf(path, () => {})
								}
							} catch (err) {
								console.error(err)
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
															SELECT array_agg(json_build_object('name', piece_name, 'value', value)) as used_pieces
															FROM (
																SELECT unnest(pieces) ->> 'name' as piece_name, json_array_elements(unnest(pieces)->'values') as value
																FROM layouts
																WHERE uuid = $1
															) as p
															WHERE value ->> 'uuid' = ANY($2::text[])
														)
														FROM layouts
														WHERE uuid = $1
													`,
													[uuid, piece_uuids]
												)
											}

											let used_pieces = []
											if (dbLayout) {
												used_pieces = dbLayout.used_pieces
												delete dbLayout.used_pieces

												dbLayout.url = `${fileNameToWebName(dbLayout.target)}/${
													dbLayout.details.name
												}`
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
					})
				})
			} catch (e) {
				throw new Error(e)
			}
		},
		submitThemes: async (parent, { files, themes, details }, context, info) => {
			try {
				return await new Promise((resolve, reject) => {})
			} catch (e) {
				throw new Error(e)
			}
		}
	}
}
