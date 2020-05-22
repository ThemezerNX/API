const gql = require('graphql-tag')

export default gql`
	type Author {
		name: String!
		discordTag: String
	}

	type LayoutDetails {
		name: String!
		uuid: String!
		author: Author!
		description: String
		menu: String!
		color: String
		tags: [String!]
		version: String!
	}

	type Piece {
		name: String!
		values: [Value!]
	}

	type Value {
		name: String!
		image: Boolean!
		json: String!
	}

	type Layout {
		name: String!
		uuid: String!
		details: LayoutDetails
		baselayout: String
		menu: String!
		last_updated: String!
		pieces: [Piece!]
	}

	type Query {
		layout(name: String!, menu: String!): Layout
		layoutsList(menu: String!): [Layout]
	}

	schema {
		query: Query
	}
`
