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
	
	directive @cacheControl(
		maxAge: Int
		scope: CacheControlScope
	) on FIELD_DEFINITION | OBJECT | INTERFACE

	directive @auth(
		requires: Role = ADMIN
	) on OBJECT | FIELD_DEFINITION
	
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

	"Full UserInfo with extra private info"
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

	"Userdata as provided by the Discord API. Stored without the id key."
	type DiscordUser {
		"Will be null if a custom_username in UserInfo or PrivateInfo is set"
		username: String
		"The four-numbers-long discriminator"
		discriminator: String!
		"The avatar ID. Used to build the correct url client-side"
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

	"A payload with details on the TOS acceptance and the backup code. Requested on every default layout render."
	type authPayload {
		"false by default"
		has_accepted: Boolean!
		"Returns null if has_accepted is true"
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
		"A UUID which should only be used for db queries from the Layout repository"
		uuid: GUID!
		"The main identifier"
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
		"The main identifier"
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
		"The main identifier"
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
		"The main identifier"
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

		"An array of ALL categories in the DB. Used listing all already-existing categories when submitting"
		categories: [String!]

		layout(id: String!): Layout
		theme(id: String!): Theme
		pack(id: String!): Pack
		
		randomLayoutIDs(target: String, limit: Int): [String!]! @cacheControl(maxAge: 0)
		randomThemeIDs(target: String, limit: Int): [String!]! @cacheControl(maxAge: 0)
		randomPackIDs(limit: Int): [String!]! @cacheControl(maxAge: 0)
		
		"Errors return the most up-to-date valid argument values"
		layoutList(
			target: String
			limit: Int
			page: Int
			query: String
			sort: String
			order: String
			creators: [String!]
		): [Layout!]
		"Errors return the most up-to-date valid argument values"
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
		"Errors return the most up-to-date valid argument values"
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

		"A special query which has data formatted specially for the NXThemes Installer HB application"
		nxinstaller(id: String!): NXInstallerResponse! @cacheControl(maxAge: 0)

		## Overlay creation tool
		createOverlayNXThemes(layout: Upload, piece: Upload, common: Upload): [File!] @cacheControl(maxAge: 0)
		createOverlay(blackImg: Upload!, whiteImg: Upload!): File! @cacheControl(maxAge: 0)
		
		"The pagination query. A bit of a special one. This can and will only be queryied when a list is queried in the same request"
		pagination(hash: String!): Pagination
	}

	type Mutation {
		# Authed
		updateAuth(accepts: Boolean): authPayload
		restoreAccount(creator_id: String!, backup_code: String!): Boolean!

		"null/undefined values are treated as unset, not 'keep previous'"
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

		"Returns the url the client should redirect to"
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
