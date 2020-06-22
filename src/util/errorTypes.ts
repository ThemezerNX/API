export const errorName = {
	UNKNOWN: 'UNKNOWN',
	INVALID_FIELD: 'INVALID_FIELD',

	UNAUTHORIZED: 'UNAUTHORIZED',
	ALREADY_AUTHORIZED: 'ALREADY_AUTHORIZED',
	AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
	NO_CONTENT: 'NO_CONTENT',

	CREATOR_NOT_EXIST: 'CREATOR_NOT_EXIST',

	FILE_READ_ERROR: 'FILE_READ_ERROR',
	FILE_SAVE_ERROR: 'FILE_SAVE_ERROR',
	FILE_TOO_BIG: 'FILE_TOO_BIG',
	MAX_50_NXTHEMES: 'MAX_50_NXTHEMES',
	INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
	INVALID_TMP: 'INVALID_TMP',
	INVALID_TARGET_NAME: 'INVALID_TARGET_NAME',
	INVALID_CATEGORY_AMOUNT: 'INVALID_CATEGORY_AMOUNT',
	INVALID_NXTHEME_CONTENTS: 'INVALID_NXTHEME_CONTENTS',
	ZIP_READ_ERROR: 'ZIP_READ_ERROR',
	NO_VALID_NXTHEMES: 'NO_VALID_NXTHEMES',
	NO_NXTHEMES_IN_ZIP: 'NO_NXTHEMES_IN_ZIP',

	NXTHEME_CREATE_FAILED: 'NXTHEME_CREATE_FAILED',
	NXTHEME_UNPACK_FAILED: 'NXTHEME_UNPACK_FAILED',
	PACK_CREATE_FAILED: 'PACK_CREATE_FAILED',

	LAYOUT_NOT_FOUND: 'LAYOUT_NOT_FOUND',
	THEME_NOT_FOUND: 'THEME_NOT_FOUND',
	PACK_NOT_FOUND: 'PACK_NOT_FOUND',

	DB_SAVE_ERROR: 'DB_SAVE_ERROR'
}

export const errorType = {
	UNKNOWN: {
		message: 'Unknown error',
		statusCode: 0
	},
	INVALID_FIELD(field, type) {
		return {
			message: `Field '${field}' cannot be queried on type` + (type ? ` ${type}` : ''),
			statusCode: 1
		}
	},
	// Status
	UNAUTHORIZED: {
		message: 'Authentication is required',
		statusCode: 401
	},
	ALREADY_AUTHORIZED: {
		message: 'Already authenticated',
		statusCode: 402
	},
	AUTHORIZATION_ERROR: {
		message: 'An authorization error occurred',
		statusCode: 403
	},
	NO_CONTENT: {
		message: 'No data to return',
		statusCode: 204
	},
	// Creator messages
	CREATOR_NOT_EXIST: {
		message: 'Creator not found',
		statusCode: 1000
	},
	// Themes
	FILE_READ_ERROR: {
		message: "Couldn't read file",
		statusCode: 4000
	},
	FILE_SAVE_ERROR: {
		message: "Couldn't write file",
		statusCode: 4001
	},
	FILE_TOO_BIG: {
		message: 'The file is too big',
		statusCode: 4002
	},
	MAX_50_NXTHEMES: {
		message: 'A maximum of 50 nxthemes is allowed',
		statusCode: 4003
	},
	INVALID_FILE_TYPE: {
		message: 'Invalid file type detected',
		statusCode: 4004
	},
	INVALID_TMP: {
		message: 'Invalid tmp argument',
		statusCode: 4005
	},
	INVALID_TARGET_NAME: {
		message: 'Invalid target name',
		statusCode: 4006
	},
	INVALID_CATEGORY_AMOUNT: {
		message: 'Max 10 categories allowed',
		statusCode: 4007
	},

	INVALID_NXTHEME_CONTENTS: {
		message: 'Invalid NXTheme contents',
		statusCode: 4010
	},
	ZIP_READ_ERROR: {
		message: 'The zip could not be extracted',
		statusCode: 4011
	},
	NO_VALID_NXTHEMES: {
		message: 'No valid NXThemes were detected',
		statusCode: 4012
	},
	NO_NXTHEMES_IN_ZIP: {
		message: 'No NXThemes were detected in the zip',
		statusCode: 4013
	},

	NXTHEME_CREATE_FAILED: {
		message: 'Failed to create the NXTheme, please report this with details.',
		statusCode: 4100
	},
	NXTHEME_UNPACK_FAILED: {
		message: 'Failed to unpack the NXTheme',
		statusCode: 4101
	},
	PACK_CREATE_FAILED: {
		message: 'Failed to create the pack, please report this with details.',
		statusCode: 4102
	},

	LAYOUT_NOT_FOUND: {
		message: 'The requested layout does not exist',
		statusCode: 4200
	},
	THEME_NOT_FOUND: {
		message: 'The requested theme does not exist',
		statusCode: 4201
	},
	PACK_NOT_FOUND: {
		message: 'The requested pack does not exist',
		statusCode: 4202
	},

	// DB errors
	DB_SAVE_ERROR: {
		message: 'Failed saving data to DB',
		statusCode: 5000
	}
}
