const gql = require('graphql-tag')

export default gql`
	scalar Upload
	scalar GUID
	scalar DateTime
	scalar HexColorCode
	scalar JSON

	type DiscordUser {
		username: String!
		discriminator: String!
		avatar: String
		system: Boolean
		locale: String
	}

	type UserInfo {
		id: String!
		discord_user: DiscordUser!
		biography: String
		joined: DateTime!
		role: String
	}

	type Author {
		name: String!
		discord_tag: String
	}

	type LayoutDetails {
		name: String!
		description: String!
		author: Author!
		target: String!
		color: HexColorCode
		version: String!
	}

	input DetailsInput {
		name: String
		description: String
		color: HexColorCode
		categories: [String!]
		version: String
	}

	type ThemeDetails {
		name: String!
		description: String
		color: HexColorCode
		version: String!
	}

	type PackDetails {
		name: String!
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
		id: Int!
		details: LayoutDetails!
		baselayout: JSON!
		target: String!
		last_updated: DateTime!
		has_pieces: Boolean!
		pieces: [Piece!]
		has_commonlayout: Boolean!
		commonlayout: JSON
		dl_count: Int!
	}

	type Theme {
		uuid: GUID!
		id: Int!
		creator: UserInfo!
		details: ThemeDetails!
		layout: Layout
		pack: Pack
		target: String!
		last_updated: DateTime!
		pieces: [UsedPiece!]
		categories: [String!]
		dl_count: Int!
		bg_type: String
	}

	type Pack {
		uuid: GUID!
		id: Int!
		creator: UserInfo!
		details: PackDetails!
		last_updated: DateTime!
		categories: [String!]
		dl_count: Int!
		themes: [Theme!]
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
		description: String
		color: String
		version: String
		categories: [String!]
		nsfw: Boolean
	}

	type Query {
		me: UserInfo!
		creator(id: String!): UserInfo!

		categories: [String!]

		layout(id: Int!, target: String!): Layout
		layoutsList(target: String!): [Layout]

		theme(id: Int!, target: String!): Theme
		themesList(target: String!): [Theme]

		pack(id: Int!): Pack
		packsList: [Pack]
	}

	type Mutation {
		createOverlaysNXTheme(layout: Upload!): [File!]
		createOverlay(themeName: String, blackImg: Upload!, whiteImg: Upload!): File!

		createNXTheme(themeName: String, author: String, image: Upload, layout: Upload): File!

		uploadSingleOrZip(file: Upload!): [DetectedTheme!]
		submitThemes(files: [Upload!], themes: [DetectedThemeInput!], details: DetailsInput!, type: String!): Boolean

		mergeJson(uuid: GUID!, piece_uuids: [GUID!], common: Boolean): JSON!

		downloadTheme(uuid: GUID!, piece_uuids: [GUID!]): File!
		downloadPack(uuid: GUID!): File!
	}

	schema {
		query: Query
		mutation: Mutation
	}
`
