exports.errorName = {
	UNKNOWN: 'UNKNOWN',
	INVALID_FIELD: 'INVALID_FIELD',

	UNAUTHORIZED: 'UNAUTHORIZED',
	ALREADY_AUTHORIZED: 'ALREADY_AUTHORIZED',
	AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
	NO_CONTENT: 'NO_CONTENT',

	USER_NOT_EXIST: 'USER_NOT_EXIST',
	USER_EXISTS: 'USER_EXISTS',
	USER_PASSWORD_INCORRECT: 'USER_PASSWORD_INCORRECT'
}

exports.errorType = {
	UNKNOWN: {
		message: 'Unknown error',
		statusCode: 0
	},
	INVALID_FIELD(field, type) {
		return {
			message:
				`Field '${field}' cannot be queried on type` +
				(type ? ` ${type}` : ''),
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
	}
}
