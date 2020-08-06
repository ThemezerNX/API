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

	type Pagination {
		page: Int!
		limit: Int
		page_count: Int!
		item_count: Int!
	}

	type PrivateInfo {
		id: String!
		discord_user: DiscordUser!
		custom_username: String
		bio: String
		joined: DateTime!
		role: String
		banner_image: String
		logo_image: String
		profile_color: String
		liked: MyLikes
		like_count: Int
	}

	type UserInfo {
		id: String!
		discord_user: DiscordUser!
		custom_username: String
		bio: String
		joined: DateTime!
		role: String
		banner_image: String
		logo_image: String
		profile_color: String
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
		id: String!
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
		id: String!
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
		id: String!
		creator: UserInfo!
		details: PackDetails!
		last_updated: DateTime!
		categories: [String!]
		dl_count: Int!
		like_count: Int
		themes: [Theme!]
	}

	type NXInstallerResponse {
		name: String
		target: String!
		url: String!
		preview: String!
		id: String!
	}

	type FileUrl {
		filename: String
		url: String!
		mimetype: String
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
		layout_id: GUID
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
		me: PrivateInfo! @cacheControl(scope: PRIVATE, maxAge: 0)

		# Unauthed
		## General
		creator(id: String!): UserInfo!

		categories: [String!]

		layout(id: String!): Layout
		layoutList(
			target: String
			limit: Int
			page: Int
			query: String
			sort: String
			order: String
			creators: [String!]
		): [Layout!]

		theme(id: String!): Theme
		themeList(
			target: String
			limit: Int
			page: Int
			query: String
			sort: String
			order: String
			creators: [String!]
			layouts: [String!]
			nsfw: Boolean
		): [Theme!]

		pack(id: String!): Pack
		packList(
			limit: Int
			page: Int
			query: String
			sort: String
			order: String
			creators: [String!]
			layouts: [String!]
			nsfw: Boolean
		): [Pack!]

		## Downloading
		downloadLayout(id: String!, piece_uuids: [GUID!]): JSON! @cacheControl(maxAge: 300)
		downloadCommonLayout(id: String!): JSON! @cacheControl(maxAge: 300)

		downloadTheme(id: String!, piece_uuids: [GUID!]): FileUrl! @cacheControl(maxAge: 300)

		downloadPack(id: String!): FileUrl! @cacheControl(maxAge: 300)

		nxinstaller(id: String!): [NXInstallerResponse!] @cacheControl(maxAge: 300)

		## Overlay creation tool
		createOverlayNXThemes(layout: Upload!, piece: Upload, common: Upload): [File!] @cacheControl(maxAge: 0)
		createOverlay(blackImg: Upload!, whiteImg: Upload!): File! @cacheControl(maxAge: 0)

		pagination(hash: String!): Pagination
	}

	type Mutation {
		# Authed
		updateAuth(accepts: Boolean): authPayload

		restoreAccount(creator_id: String!, backup_code: String!): Boolean!

		updateProfile(
			custom_username: String
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
