const gql = require('graphql-tag')

export default gql`
	scalar Upload
	scalar GUID
	scalar DateTime
	scalar HexColorCode
	scalar JSON

	type Author {
		name: String!
		discordTag: String
	}

	input AuthorInput {
		name: String!
		discordTag: String
	}

	type LayoutDetails {
		name: String!
		uuid: GUID!
		author: Author!
		description: String
		target: String!
		color: HexColorCode
		version: String!
	}

	input DetailsInput {
		name: String!
		author: AuthorInput!
		description: String
		color: HexColorCode
		tags: [String!]
		version: String!
	}

	type Value {
		value: String!
		image: String!
		uuid: GUID!
		json: JSON!
	}

	input ValueInput {
		value: String!
	}

	type Piece {
		name: String!
		values: [Value!]
	}

	type UsedPiece {
		name: String!
		value: Value
	}

	input UsedPieceInput {
		name: String!
		value: ValueInput
	}

	type Layout {
		name: String!
		uuid: GUID!
		details: LayoutDetails!
		baselayout: JSON!
		target: String!
		last_updated: DateTime!
		has_pieces: Boolean
		pieces: [Piece!]
		url: String!
	}

	type File {
		filename: String
		data: String!
		mimetype: String
	}

	type ThemeInfo {
		ThemeName: String!
		Author: String
		LayoutInfo: String
	}

	input ThemeInfoInput {
		ThemeName: String!
		Author: String
		LayoutInfo: String
	}

	type DetectedTheme {
		info: ThemeInfo
		tmp: String
		layout: Layout
		used_pieces: [UsedPiece]
		target: String!
	}

	input DetectedThemeInput {
		info: ThemeInfoInput
		tmp: String
		layout_uuid: GUID
		used_pieces: [UsedPieceInput]
		target: String!
	}

	type Query {
		layout(name: String!, target: String!): Layout
		layoutsList(target: String!): [Layout]
	}

	type Mutation {
		createOverlaysNXTheme(layout: Upload!): [File!]
		createOverlay(themeName: String, blackImg: Upload!, whiteImg: Upload!): File!

		createNXTheme(themeName: String, author: String, image: Upload, layout: Upload): File!

		uploadSingleOrZip(file: Upload!): [DetectedTheme!]
		submitThemes(files: [Upload!], themes: [DetectedThemeInput!], details: DetailsInput!): String
	}

	schema {
		query: Query
		mutation: Mutation
	}
`
