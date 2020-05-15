const gql = require('graphql-tag')

export default gql`
	type Layout {
		uuid: String!
		username: String!
		email: String!
		password_hash: String!
		joined: String!
	}

	type Query {
		# allUsers: [User!]
		Layouts: [Layout!]
		emailAvailable(email: String!): Boolean!
	}

	schema {
		query: Query
	}
`
