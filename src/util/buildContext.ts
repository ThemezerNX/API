import axios from 'axios'
import { db } from '../db/db'

const discordApiBase = 'https://discord.com/api'

function cleanString(input) {
	var output = ''
	for (var i = 0; i < input.length; i++) {
		if (input.charCodeAt(i) <= 127) {
			output += input.charAt(i)
		}
	}
	return output
}

const buildCommonContext = (req, additionalContext: {}) => ({
	authenticate: () => {
		const token = req.headers.token
		if (token) {
			return new Promise((resolve, reject) => {
				axios({
					url: discordApiBase + '/users/@me',
					headers: {
						Authorization: token
					}
				})
					.then(async (res) => {
						const id = res.data.id
						delete res.data.id

						res.data.username = cleanString(res.data.username)

						try {
							req.user = await db.oneOrNone(
								`
									INSERT INTO creators (id, discord_user, joined, backup_code)
									VALUES ($1, $2, NOW(), md5(random()::varchar)::varchar)
									ON CONFLICT (id)
										DO UPDATE
										SET discord_user = EXCLUDED.discord_user
									RETURNING *, coalesce(custom_username, discord_user ->> 'username') AS display_name
								`,
								[id, res.data]
							)

							// Then add the user object to the original req object
							resolve(true)
						} catch (e) {
							reject(e)
						}
					})
					.catch(() => {
						resolve(false)
					})
			})
		} else return false
	},
	req,
	...additionalContext
})

const buildContext = (contextParams) => {
	const { req, connection, payload, ...additionalContext } = contextParams

	if (connection) {
		return buildCommonContext(connection.context.req, additionalContext)
	}

	const sharedContext = buildCommonContext(req as any, additionalContext)

	return {
		...sharedContext
	}
}

export default buildContext
