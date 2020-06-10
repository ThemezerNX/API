export const errorName = {
	UNKNOWN: 'UNKNOWN',
	INVALID_FIELD: 'INVALID_FIELD',

	UNAUTHORIZED: 'UNAUTHORIZED',
	ALREADY_AUTHORIZED: 'ALREADY_AUTHORIZED',
	AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
	NO_CONTENT: 'NO_CONTENT',

	USER_NOT_EXIST: 'USER_NOT_EXIST',
	USER_EXISTS: 'USER_EXISTS',
	USER_PASSWORD_INCORRECT: 'USER_PASSWORD_INCORRECT',

	FILE_READ_ERROR: 'FILE_READ_ERROR',
	FILE_SAVE_ERROR: 'FILE_SAVE_ERROR',
	FILE_TOO_BIG: 'FILE_TOO_BIG',
	INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
	INVALID_TMP: 'INVALID_TMP',
	INVALID_TARGET_NAME: 'INVALID_TARGET_NAME',
	INVALID_NXTHEME_CONTENTS: 'INVALID_NXTHEME_CONTENTS',
	ZIP_READ_ERROR: 'ZIP_READ_ERROR',
	NO_NXTHEMES_IN_ZIP: 'NO_NXTHEMES_IN_ZIP',

	NXTHEME_CREATE_FAILED: 'NXTHEME_CREATE_FAILED',
	NXTHEME_UNPACK_FAILED: 'NXTHEME_UNPACK_FAILED',

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
	// User messages
	USER_NOT_EXIST: {
		message: 'Email not registered',
		statusCode: 1000
	},
	USER_EXISTS: {
		message: 'Email already registered',
		statusCode: 1001
	},
	USER_PASSWORD_INCORRECT: {
		message: 'Password incorrect',
		statusCode: 1002
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
	INVALID_FILE_TYPE: {
		message: 'Invalid file type detected',
		statusCode: 4003
	},
	INVALID_TMP: {
		message: 'Invalid tmp argument',
		statusCode: 4004
	},
	INVALID_TARGET_NAME: {
		message: 'Invalid target name',
		statusCode: 4005
	},
	INVALID_NXTHEME_CONTENTS: {
		message: 'Invalid NXTheme contents',
		statusCode: 4006
	},
	ZIP_READ_ERROR: {
		message: 'The zip could not be extracted',
		statusCode: 4008
	},
	NO_NXTHEMES_IN_ZIP: {
		message: 'No NXThemes were found in the zip',
		statusCode: 4009
	},

	NXTHEME_CREATE_FAILED: {
		message: 'Failed to create the NXTheme, please report this with details.',
		statusCode: 4100
	},
	NXTHEME_UNPACK_FAILED: {
		message: 'Failed to unpack the NXTheme',
		statusCode: 4101
	},

	// DB errors
	DB_SAVE_ERROR: {
		message: 'Failed saving data to DB',
		statusCode: 4200
	}
}
