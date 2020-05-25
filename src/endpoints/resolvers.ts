const graphqlFields = require('graphql-fields')
const path = require('path')
const util = require('util')
import { pgp, db } from '../db/db'
import {
	webNameToFileNameNoExtension,
	fileNameToThemeTarget
} from '../util/convertName'
import GraphQLJSON from 'graphql-type-json'
import { PythonShell } from 'python-shell'
const link = require('fs-symlink')
const { createWriteStream, unlink, readFile, writeFile } = require('fs')
const writeFilePromisified = util.promisify(writeFile)
const readFilePromisified = util.promisify(readFile)
var tmp = require('tmp')
var im = require('imagemagick')
// import { errorName } from '../util/errorTypes'

const saveFiles = (files, path) =>
	files.map(
		(file) =>
			new Promise(async (resolve, reject) => {
				const { createReadStream, filename, mimetype } = await file
				const stream = createReadStream()

				// Create a stream to which the upload will be written.
				const writeStream = createWriteStream(`${path}/${filename}`)

				// When the upload is fully written, resolve the promise.
				writeStream.on('finish', () => {
					resolve(filename)
				})

				// If there's an error writing the file, remove the partially written file
				// and reject the promise.
				writeStream.on('error', (error) => {
					unlink(path, () => {
						reject(error)
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

const createNXTheme = (themes) =>
	themes.map(
		(theme) =>
			new Promise((resolve, reject) => {
				tmp.dir(async function _tempDirCreated(
					err,
					path,
					cleanupCallback
				) {
					if (err) throw err

					if (
						!(
							theme.imagePath.endsWith('.dds') ||
							theme.imagePath.endsWith('.DDS')
						)
					) {
						// Implement jpg to dds conversion
					}
					if (theme.imagePath)
						await link(theme.imagePath, `${path}/image.dds`)
					if (theme.layoutPath)
						await link(theme.layoutPath, `${path}/layout.json`)

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

					await writeFilePromisified(
						`${path}/info.json`,
						JSON.stringify(info),
						'utf8'
					)

					const options = {
						pythonPath: 'python3.8',
						scriptPath: `${__dirname}/../../../SARC-Tool`,
						args: [
							'-little',
							'-compress',
							'3',
							'-o',
							`${path}/theme.nxtheme`,
							path
						]
					}

					PythonShell.run('main.py', options, async function(err) {
						if (err) throw err
						resolve({
							filename: `${theme.themeName} - ${LayoutInfo}.nxtheme`,
							data: await readFilePromisified(
								`${path}/theme.nxtheme`,
								'base64'
							),
							mimetype: 'application/nxtheme'
						})
					})

					cleanupCallback()
				})
			})
	)

export = {
	JSON: GraphQLJSON,
	Query: {
		layout: async (parent, { name, menu }, context, info) => {
			try {
				const dbData = await db.oneOrNone(
					`
					SELECT *,
					CASE WHEN (cardinality(pieces) > 0) THEN true ELSE false END AS has_pieces
					from layouts
					WHERE name = $1
						AND menu = $2
				`,
					[name, webNameToFileNameNoExtension(menu)]
				)

				return dbData
			} catch (e) {
				console.error(e)
			}
		},
		layoutsList: async (parent, { menu }, context, info) => {
			try {
				const dbData = await db.any(
					`
					SELECT *,
					CASE WHEN (cardinality(pieces) > 0) THEN true ELSE false END AS has_pieces
					FROM layouts
					WHERE menu = $1
				`,
					[webNameToFileNameNoExtension(menu)]
				)

				return dbData
			} catch (e) {
				console.error(e)
			}
		}
	},
	Mutation: {
		createOverlay: async (
			parent,
			{ themeName, blackImg, whiteImg },
			context,
			info
		) => {
			try {
				// DOS script:
				// magick convert black.jpg white.jpg -alpha off ^
				// ( -clone 0,1 -compose difference -composite -threshold 50%% -negate ) ^
				// ( -clone 0,2 +swap -compose divide -composite ) ^
				// -delete 0,1 +swap -compose Copy_Opacity -composite ^
				// result.png

				return await new Promise((resolve, reject) => {
					tmp.dir(async function _tempDirCreated(
						err,
						path,
						cleanupCallback
					) {
						if (err) throw err

						const filePromises = saveFiles(
							[blackImg, whiteImg],
							path
						)

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
									reject(stderr)
								} else {
									console.log(stdout)
									resolve({
										filename: themeName
											? `${themeName}_overlay.png`
											: `overlay.png`,
										data: await readFilePromisified(
											`${path}/overlay.png`,
											'base64'
										),
										mimetype: 'image/png'
									})
								}
							}
						)
						cleanupCallback()
					})
				})
			} catch (e) {
				console.error(e)
			}
		},
		createOverlaysNXTheme: async (parent, { layout }, context, info) => {
			try {
				return await new Promise((resolve, reject) => {
					if (layout)
						tmp.dir(async function _tempDirCreated(
							err,
							path,
							cleanupCallback
						) {
							if (err) throw err

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

							const themePromises = createNXTheme(themes)

							const themesB64 = await Promise.all(themePromises)

							resolve(themesB64)

							cleanupCallback()
						})
					else reject()
				})
			} catch (e) {
				console.error(e)
			}
		}
	}
}
