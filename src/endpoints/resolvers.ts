const graphqlFields = require('graphql-fields')
import { pgp, db } from '../db/db'
import targetName from '../util/menu'
// import { errorName } from '../util/errorTypes'

export = {
	Query: {
		layout: async (parent, { name, menu }, context, info) => {
			try {
				const dbData = await db.oneOrNone(
					`
					SELECT * from layouts
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
					SELECT *
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
	}
}
