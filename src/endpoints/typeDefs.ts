const gql = require('graphql-tag')

export default gql`
	scalar Upload
	scalar GUID
	scalar DateTime
	scalar HexColorCode
	scalar JSON

	enum CacheControlScope {
		PUBLIC
		PRIVATE
	}

	directive @cacheControl(maxAge: Int, scope: CacheControlScope) on FIELD_DEFINITION | OBJECT | INTERFACE

	type UserInfo {
		id: String!
		discord_user: DiscordUser!
		bio: String
		joined: DateTime!
		role: String
		banner_image: String
		logo_image: String
		profile_color: String
		liked: MyLikes
		like_count: Int
	}

	type DiscordUser {
		username: String!
		discriminator: String!
		avatar: String
		system: Boolean
		locale: String
	}

	type MyLikes {
		creators: [UserInfo!]
		layouts: [Layout!]
		themes: [Theme!]
		packs: [Pack!]
	}

	type authPayload {
		has_accepted: Boolean!
		backup_code: String
	}

	interface Details {
		name: String!
		version: String!
	}

	type LayoutDetails implements Details {
		name: String!
		description: String!
		color: HexColorCode
		version: String!
	}

	type ThemeDetails implements Details {
		name: String!
		description: String
		version: String!
	}

	type PackDetails implements Details {
		name: String!
		description: String!
		version: String!
	}

	input DetailsInput {
		name: String
		description: String
		color: HexColorCode
		categories: [String!]
		version: String
	}

	type Layout {
		uuid: GUID!
		id: Int!
		creator: UserInfo!
		details: LayoutDetails!
		baselayout: JSON!
		target: String!
		last_updated: DateTime!
		has_pieces: Boolean!
		pieces: [Piece!]
		has_commonlayout: Boolean!
		commonlayout: JSON
		dl_count: Int!
		like_count: Int
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
		bg_type: String
		dl_count: Int!
		like_count: Int
	}

	type Pack {
		uuid: GUID!
		id: Int!
		creator: UserInfo!
		details: PackDetails!
		last_updated: DateTime!
		categories: [String!]
		dl_count: Int!
		like_count: Int
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
		# Authed
		me: UserInfo! @cacheControl(scope: PRIVATE)

		# Unauthed
		## General
		creator(id: String!): UserInfo!

		categories: [String!]

		layout(id: Int!, target: String!): Layout
		layoutsList(target: String, creator_id: String, limit: Int): [Layout!]

		theme(id: Int!, target: String!): Theme
		themesList(target: String, creator_id: String, limit: Int): [Theme!]

		pack(id: Int!): Pack
		packsList(creator_id: String, limit: Int): [Pack!]

		## Downloading
		mergeJson(uuid: GUID!, piece_uuids: [GUID!], common: Boolean): JSON! @cacheControl(maxAge: 300)

		downloadTheme(uuid: GUID!, piece_uuids: [GUID!]): File! @cacheControl(maxAge: 300)

		downloadPack(uuid: GUID!): File! @cacheControl(maxAge: 300)

		## Overlay creation tool
		createOverlaysNXTheme(layout: Upload!): [File!]
		createOverlay(themeName: String, blackImg: Upload!, whiteImg: Upload!): File!
	}

	type Mutation {
		# Authed
		updateAuth(accepts: Boolean): authPayload

		restoreAccount(creator_id: String!, backup_code: String!): Boolean!

		profile(
			bio: String
			profile_color: String
			banner_image: Upload
			logo_image: Upload
			clear_banner_image: Boolean
			clear_logo_image: Boolean
		): Boolean

		# Unauthed
		## Submitting

		uploadSingleOrZip(file: Upload!): [DetectedTheme!]
		submitThemes(files: [Upload!], themes: [DetectedThemeInput!], details: DetailsInput!, type: String!): Boolean

		## Upvoting
		setLike(type: String!, id: String!, value: Boolean!): Boolean
	}

	schema {
		query: Query
		mutation: Mutation
	}
`
