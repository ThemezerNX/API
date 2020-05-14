const consola = require('consola')
const bcrypt = require('bcryptjs')
const graphqlFields = require('graphql-fields')
const { PubSub, withFilter } = require('apollo-server-express')
const { errorName } = require('../errorTypes')

module.exports = (pgp, db, dbFunctions, functions) => {
	return {
		Query: {
			// allUsers: (parent, args, context, info) => {
			//     if (context.req.isAuthenticated()) {
			//         return joinMonster(info, args, (sql) => {
			//             return db.any(sql)
			//         })
			//     }
			// },
			emailAvailable: async (parent, { email }, context, info) => {
				const dbData = await db.oneOrNone(
					`SELECT 1 from users WHERE email = $1`,
					[email]
				)
				if (!dbData) {
					return true
				} else return false
			},
			me: (parent, args, context, info) => {
				if (context.req.isAuthenticated()) {
					return db.one(`SELECT * from users WHERE uuid = $1`, [
						context.req.user.uuid
					])
				} else {
					throw new Error(errorName.UNAUTHORIZED)
				}
			}
		},
		Mutation: {
			register: async (
				parent,
				{ username, email, password },
				context
			) => {
				if (!context.req.isAuthenticated()) {
					const res = await db.oneOrNone(
						'SELECT password_hash FROM users WHERE email = $1',
						[email]
					)
					if (res) {
						throw new Error(errorName.USER_EXISTS)
					} else {
						const resHash = await bcrypt.hash(password, 10)
						const user = await db.one(
							'INSERT INTO users(uuid, username, email, joined, last_logged_in, password_hash) VALUES(uuid_generate_v4(), $1, $2, NOW(), NOW(), $3) RETURNING uuid, username, email, joined, last_logged_in, role',
							[username, email, resHash]
						)
						// Immediately log in new user
						await context.login(user)
						return { user }
					}
				} else {
					throw new Error(errorName.ALREADY_AUTHORIZED)
				}
			},
			login: async (parent, { email, password }, context) => {
				if (!context.req.isAuthenticated()) {
					const { user } = await context.authenticate(
						'graphql-local',
						{
							email,
							password
						}
					)
					try {
						await context.login(user)
						return { user }
					} catch (err) {
						throw new Error(errorName.AUTHORIZATION_ERROR)
					}
				} else {
					throw new Error(errorName.ALREADY_AUTHORIZED)
				}
			},
			logout: (parent, args, context) => {
				if (context.req.isAuthenticated()) {
					try {
						context.logout()
						context.req.session.destroy()
						return 'Success'
					} catch (err) {
						throw new Error(errorName.UNKNOWN)
					}
				} else {
					throw new Error(errorName.UNAUTHORIZED)
				}
			}
		}
	}
}
