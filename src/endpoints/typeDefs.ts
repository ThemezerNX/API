const gql = require('graphql-tag')

export default gql`
	scalar Upload
	scalar JSON

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

	type Value {
		value: String!
		image: Boolean!
		json: JSON!
	}

	type Piece {
		name: String!
		values: [Value!]
	}

	type Layout {
		name: String!
		uuid: String!
		details: LayoutDetails
		baselayout: JSON
		menu: String!
		last_updated: String!
		has_pieces: Boolean
		pieces: [Piece!]
	}

	type Query {
		layout(name: String!, menu: String!): Layout
		layoutsList(menu: String!): [Layout]
	}

	type File {
		filename: String
		data: String!
		mimetype: String
	}

	type Mutation {
		createOverlaysNXTheme(layout: Upload!): [File!]
		createOverlay(
			themeName: String
			blackImg: Upload!
			whiteImg: Upload!
		): File!

		createNXTheme(
			themeName: String
			author: String
			image: Upload
			layout: Upload
		): File!
	}

	schema {
		query: Query
		mutation: Mutation
	}
`
