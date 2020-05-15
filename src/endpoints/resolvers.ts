const graphqlFields = require('graphql-fields')
import { pgp, db } from '../db/db'
import { errorName } from '../util/errorTypes'

export = {
	Query: {
		Layouts: async (parent, { email }, context, info) => {
			const dbData = await db.oneOrNone(
				`SELECT 1 from users WHERE email = $1`,
				[email]
			)
			if (!dbData) {
				return true
			} else return false
		}
	}
}
