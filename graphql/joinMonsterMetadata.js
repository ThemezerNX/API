const Metadata = {
	Query: {
		fields: {
			me: {
				where: (table, empty, uuid) => `${table}.uuid = '${uuid}'`
			}
		}
	},
	User: {
		sqlTable: 'users',
		uniqueKey: 'uuid'
	},
	UserInfo: {
		sqlTable: 'users',
		uniqueKey: 'uuid'
	}
}

module.exports = Metadata
