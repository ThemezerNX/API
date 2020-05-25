const graphqlFields = require('graphql-fields')
import { pgp, db } from '../db/db'
import targetName from '../util/menu'
import GraphQLJSON from 'graphql-type-json'
const { createWriteStream, unlink, readFileSync } = require('fs')
var tmp = require('tmp')
var im = require('imagemagick')
// import { errorName } from '../util/errorTypes'

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
					[name, targetName(menu)]
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
					[targetName(menu)]
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

						const images = [blackImg, whiteImg]

						const imageDataPromises = images.map(
							(image) =>
								new Promise(async (resolve2, reject2) => {
									const {
										createReadStream,
										filename,
										mimetype
									} = await image
									const stream = createReadStream()

									// Create a stream to which the upload will be written.
									const writeStream = createWriteStream(
										`${path}/${filename}`
									)

									// When the upload is fully written, resolve the promise.
									writeStream.on('finish', () => {
										resolve2(filename)
									})

									// If there's an error writing the file, remove the partially written file
									// and reject the promise.
									writeStream.on('error', (error) => {
										unlink(path, () => {
											reject2(error)
										})
									})

									// In node <= 13, errors are not automatically propagated between piped
									// streams. If there is an error receiving the upload, destroy the write
									// stream with the corresponding error.
									stream.on('error', (error) =>
										writeStream.destroy(error)
									)

									// Pipe the upload into the write stream.
									stream.pipe(writeStream)
								})
						)

						const imageData = await Promise.all(imageDataPromises)
						console.log(imageData)
						console.log(`${path}/${imageData[0]}`)

						im.readMetadata(`${path}/${imageData[0]}`, function(
							err,
							metadata
						) {
							if (err) throw err
							console.log('Shot at ' + metadata)
						})

						im.convert(
							[
								`${path}/${imageData[0]}`,
								`${path}/${imageData[1]}`,
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
								`${path}/overlay.jpg`
							],
							function(err, stdout, stderr) {
								if (err || stderr) {
									console.error(err)
									console.error(stderr)
									reject(stderr)
								} else {
									console.log(stdout)
									resolve({
										filename: themeName
											? `${themeName}_overlay.jpg`
											: `overlay.jpg`,
										data: readFileSync(
											`${path}/overlay.jpg`,
											{ encoding: 'base64' }
										)
									})
								}
							}
						)
					})
				})
			} catch (e) {
				console.error(e)
			}
		}
	}
}
