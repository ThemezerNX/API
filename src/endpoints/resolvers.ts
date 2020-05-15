const graphqlFields = require('graphql-fields')
import { pgp, db } from '../db/db'
// import { errorName } from '../util/errorTypes'

export = {
	Query: {
		Layout: async (parent, { name }, context, info) => {
			try {
				const dbData = await db.oneOrNone(
					`SELECT 1 from layouts WHERE name = $1`,
					[name]
				)

				if (dbData) {
					return dbData
				} else return null
			} catch (e) {
				console.error(e)
			}
		},
		Layouts: async (parent, {}, context, info) => {
			try {
				const dbData = await db.any(`
					SELECT *
					FROM layouts
				`)

				if (dbData.length > 0) {
					return dbData
				} else return null
			} catch (e) {
				console.error(e)
			}
		}
	}
}
