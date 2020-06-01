const gql = require('graphql-tag')

export default gql`
	scalar Upload
	scalar GUID
	scalar DateTime
	scalar HexColorCode
	scalar JSON

	type Author {
		name: String!
		discord_tag: String
	}

	input AuthorInput {
		name: String
		discord_tag: String
	}

	type LayoutDetails {
		name: String!
		author: Author!
		description: String!
		target: String!
		color: HexColorCode
		version: String!
	}

	input DetailsInput {
		name: String
		author: AuthorInput!
		description: String
		color: HexColorCode
		categories: [String!]
		version: String
	}

	type ThemeDetails {
		name: String!
		author: Author!
		description: String
		color: HexColorCode
		version: String!
	}

	type PackDetails {
		name: String!
		author: Author!
		description: String!
		color: HexColorCode
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
		uuid: GUID!
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
		value: ValueInput!
	}

	type Layout {
		uuid: GUID!
		details: LayoutDetails!
		baselayout: JSON!
		target: String!
		last_updated: DateTime!
		has_pieces: Boolean!
		pieces: [Piece!]
		has_commonlayout: Boolean!
		commonlayout: JSON
		webtarget: String!
	}

	type Theme {
		uuid: GUID!
		details: ThemeDetails!
		layout: Layout
		pack: Pack
		target: String!
		last_updated: DateTime!
		pieces: [UsedPiece!]
		categories: [String!]
		nsfw: Boolean!
	}

	type Pack {
		uuid: GUID!
		details: PackDetails!
		last_updated: DateTime!
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
		tmp: String!
		layout_uuid: GUID
		used_pieces: [UsedPieceInput!]
		target: String!
		authorname: String
		description: String
		color: String
		version: String
		categories: [String!]
		nsfw: Boolean
	}

	type Query {
		categories: [String!]

		layout(name: String!, target: String!): Layout
		layoutsList(target: String!): [Layout]

		theme(name: String!, target: String!): Theme
		themesList(target: String!): [Theme]
	}

	type Mutation {
		createOverlaysNXTheme(layout: Upload!): [File!]
		createOverlay(themeName: String, blackImg: Upload!, whiteImg: Upload!): File!

		createNXTheme(themeName: String, author: String, image: Upload, layout: Upload): File!

		uploadSingleOrZip(file: Upload!): [DetectedTheme!]
		submitThemes(files: [Upload!], themes: [DetectedThemeInput!], details: DetailsInput!, type: String!): Boolean
	}

	schema {
		query: Query
		mutation: Mutation
	}
`
