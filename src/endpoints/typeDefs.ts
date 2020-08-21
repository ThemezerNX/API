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

	directive @auth(requires: Role = ADMIN) on OBJECT | FIELD_DEFINITION

	enum Role {
		ADMIN
		REVIEWER
		USER
		UNKNOWN
	}

	type Pagination {
		page: Int!
		limit: Int
		page_count: Int!
		item_count: Int!
	}

	type PrivateInfo {
		id: String!
		display_name: String!
		custom_username: String
		discord_user: DiscordUser!
		bio: String
		joined: DateTime!
		roles: [String!]
		banner_image: String
		logo_image: String
		profile_color: String
		liked: MyLikes
		like_count: Int
		old_ids: [String!]
	}

	type UserInfo {
		id: String!
		display_name: String!
		custom_username: String
		discord_user: DiscordUser!
		bio: String
		joined: DateTime!
		roles: [String!]
		banner_image: String
		logo_image: String
		profile_color: String
		like_count: Int
		old_ids: [String!]
	}

	type DiscordUser {
		username: String
		discriminator: String!
		avatar: String
		# system: Boolean
		# locale: String
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
		baselayout: JSON
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

	type PreviewTypes {
		original: String!
		thumb: String!
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
		preview: PreviewTypes
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

	type NXInstallerThemes {
		id: String!
		name: String
		target: String!
		url: String!
		preview: String!
		thumbnail: String!
	}

	type NXInstallerResponse {
		groupname: String
		themes: [NXInstallerThemes!]!
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
		randomLayoutIDs(target: String, limit: Int): [String!]! @cacheControl(maxAge: 0)
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
		randomThemeIDs(target: String, limit: Int): [String!]! @cacheControl(maxAge: 0)
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
		randomPackIDs(limit: Int): [String!]! @cacheControl(maxAge: 0)
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
		downloadLayout(id: String!, piece_uuids: [GUID!]): JSON! @cacheControl(maxAge: 0)
		downloadCommonLayout(id: String!): JSON! @cacheControl(maxAge: 0)

		downloadTheme(id: String!, piece_uuids: [GUID!]): FileUrl! @cacheControl(maxAge: 0)

		downloadPack(id: String!): FileUrl! @cacheControl(maxAge: 0)

		nxinstaller(id: String!): NXInstallerResponse! @cacheControl(maxAge: 0)

		## Overlay creation tool
		createOverlayNXThemes(layout: Upload, piece: Upload, common: Upload): [File!] @cacheControl(maxAge: 0)
		createOverlay(blackImg: Upload!, whiteImg: Upload!): File! @cacheControl(maxAge: 0)

		pagination(hash: String!): Pagination
	}

	type Mutation {
		# Authed
		updateAuth(accepts: Boolean): authPayload

		restoreAccount(creator_id: String!, backup_code: String!): Boolean!

		updateProfile(
			id: String!
			custom_username: String
			bio: String
			profile_color: String
			banner_image: Upload
			logo_image: Upload
			clear_banner_image: Boolean
			clear_logo_image: Boolean
		): Boolean

		## Submitting
		uploadSingleOrZip(file: Upload!): [DetectedTheme!]
		submitThemes(files: [Upload!], themes: [DetectedThemeInput!], details: DetailsInput!, type: String!): Boolean

		## Upvoting
		setLike(type: String!, id: String!, value: Boolean!): Boolean

		deleteTheme(id: String!): String
		deletePack(id: String!): Boolean

		## Reporting
		reportURL(url: String!, type: String!, nsfw: Boolean, reason: String): Boolean
	}

	schema {
		query: Query
		mutation: Mutation
	}
`
