const gql = require('graphql-tag')

module.exports = gql`
	type User {
		uuid: String!
		username: String!
		email: String!
		password_hash: String!
		joined: String!
	}

	type UserInfo {
		uuid: String!
		username: String!
		email: String!
		joined: String!
	}

	type AuthPayload {
		user: UserInfo
	}

	type Query {
		# allUsers: [User!]
		me: UserInfo!
		emailAvailable(email: String!): Boolean!
	}

	type Mutation {
		register(
			username: String!
			email: String!
			password: String!
		): AuthPayload
		login(email: String!, password: String!): AuthPayload
		logout: String
	}

	schema {
		query: Query
		mutation: Mutation
	}
`
