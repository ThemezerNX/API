const gql = require('graphql-tag')

export default gql`
	type Author {
		name: String!
		discordTag: String
	}

	type LayoutDetails {
		name: String!
		author: Author
		description: String
		menu: String!
		color: String
		tags: [String!]
	}

	type Layout {
		uuid: String!
		name: String!
		details: LayoutDetails
		baselayout: String
	}

	type Query {
		Layout(name: String!): Layout
		Layouts: [Layout!]
	}

	schema {
		query: Query
	}
`
