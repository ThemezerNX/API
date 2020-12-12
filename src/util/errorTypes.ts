export const errorName = {
    UNKNOWN: 'UNKNOWN',
    SUBMISSIONS_DISABLED: 'SUBMISSIONS_DISABLED',
    INVALID_FIELD: 'INVALID_FIELD',

    UNAUTHORIZED: 'UNAUTHORIZED',
    SUBMITTING_BLOCKED: 'SUBMITTING_BLOCKED',
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
    INVALID_ID: 'INVALID_ID',
    INVALID_TARGET_NAME: 'INVALID_TARGET_NAME',
    TARGETS_DONT_MATCH: 'TARGETS_DONT_MATCH',
    NO_COMMON_ALLOWED: 'NO_COMMON_ALLOWED',
    INVALID_CATEGORY_AMOUNT: 'INVALID_CATEGORY_AMOUNT',
    INVALID_NXTHEME_CONTENTS: 'INVALID_NXTHEME_CONTENTS',
    ZIP_READ_ERROR: 'ZIP_READ_ERROR',
    NO_VALID_NXTHEMES: 'NO_VALID_NXTHEMES',
    NO_NXTHEMES_IN_ZIP: 'NO_NXTHEMES_IN_ZIP',

    NXTHEME_CREATE_FAILED: 'NXTHEME_CREATE_FAILED',
    NXTHEME_UNPACK_FAILED: 'NXTHEME_UNPACK_FAILED',
    PACK_CREATE_FAILED: 'PACK_CREATE_FAILED',

    NXINSTALLER_ID_INVALID: 'NXINSTALLER_ID_INVALID',

    LAYOUT_NOT_FOUND: 'LAYOUT_NOT_FOUND',
    PIECE_NOT_FOUND: 'PIECE_NOT_FOUND',
    THEME_NOT_FOUND: 'THEME_NOT_FOUND',
    PACK_NOT_FOUND: 'PACK_NOT_FOUND',

    CANNOT_SEARCH_QUERY: 'CANNOT_SEARCH_QUERY',
    CANNOT_FILTER_NSFW: 'CANNOT_FILTER_NSFW',
    CANNOT_FILTER_CREATORS: 'CANNOT_FILTER_CREATORS',
    CANNOT_FILTER_LAYOUTS: 'CANNOT_FILTER_LAYOUTS',
    INVALID_SORT: 'INVALID_SORT',
    CANNOT_SORT_BY_DOWNLOADS: 'CANNOT_SORT_BY_DOWNLOADS',
    CANNOT_SORT_BY_LIKES: 'CANNOT_SORT_BY_LIKES',
    CANNOT_SORT_BY_UPDATED: 'CANNOT_SORT_BY_UPDATED',
    INVALID_ORDER: 'INVALID_ORDER',

    DB_SAVE_ERROR: 'DB_SAVE_ERROR',
};

export const errorType = {
    UNKNOWN: {
        message: 'Unknown error',
        statusCode: 500,
    },
    SUBMISSIONS_DISABLED: {
        message: 'Due to issues submissions are temporarily disabled',
        statusCode: 500,
    },
    INVALID_FIELD(field, type) {
        return {
            message: `Field '${field}' cannot be queried on type` + (type ? ` ${type}` : ''),
            statusCode: 1,
        };
    },

    // Status
    UNAUTHORIZED: {
        message: 'Authentication is required',
        statusCode: 401,
    },
    SUBMITTING_BLOCKED: {
        message: "You have been blocked from submitting",
        statusCode: 401,
    },
    ALREADY_AUTHORIZED: {
        message: 'Already authenticated',
        statusCode: 402,
    },
    AUTHORIZATION_ERROR: {
        message: 'An authorization error occurred',
        statusCode: 403,
    },
    NO_CONTENT: {
        message: 'No data to return',
        statusCode: 204,
    },

    // Creator messages
    CREATOR_NOT_EXIST: {
        message: 'Creator not found',
        statusCode: 404,
    },

    // Themes
    FILE_READ_ERROR: {
        message: "Couldn't read file",
        statusCode: 4000,
    },
    FILE_SAVE_ERROR: {
        message: "Couldn't write file",
        statusCode: 4001,
    },
    FILE_TOO_BIG: {
        message: 'The file is too big',
        statusCode: 4002,
    },
    MAX_50_NXTHEMES: {
        message: 'A maximum of 50 nxthemes is allowed',
        statusCode: 4003,
    },
    INVALID_FILE_TYPE: {
        message: 'Invalid file type detected',
        statusCode: 4004,
    },
    INVALID_TMP: {
        message: 'Invalid tmp argument',
        statusCode: 4005,
    },
    INVALID_ID: {
        message: 'Invalid Themezer Layout ID',
        statusCode: 4006,
    },
    INVALID_TARGET_NAME: {
        message: 'Invalid target name. What have you done?',
        statusCode: 4007,
    },
    TARGETS_DONT_MATCH: {
        message: "The target of the theme and the detected layout don't match",
        statusCode: 4008,
    },
    NO_COMMON_ALLOWED: {
        message: 'A common layout is not allowed in this nxtheme file',
        statusCode: 4009,
    },
    INVALID_CATEGORY_AMOUNT: {
        message: 'Categories has a min of 1 and max 10.',
        statusCode: 4010,
    },

    INVALID_NXTHEME_CONTENTS: {
        message: 'Invalid NXTheme contents',
        statusCode: 4100,
    },
    ZIP_READ_ERROR: {
        message: 'The zip could not be extracted',
        statusCode: 4101,
    },
    NO_VALID_NXTHEMES: {
        message: 'No valid NXThemes were detected',
        statusCode: 4102,
    },
    NO_NXTHEMES_IN_ZIP: {
        message: 'No NXThemes were detected in the zip',
        statusCode: 4103,
    },

    NXTHEME_CREATE_FAILED: {
        message: 'Failed to create the NXTheme, please report this with details',
        statusCode: 4200,
    },
    NXTHEME_UNPACK_FAILED: {
        message: 'Failed to unpack the NXTheme',
        statusCode: 4201,
    },
    PACK_CREATE_FAILED: {
        message: 'Failed to create the pack, please report this with details',
        statusCode: 4202,
    },

    NXINSTALLER_ID_INVALID: {
        message: "The ID should start with a 'p' for Packs or a 't' for Themes",
        statusCode: 4300,
    },

    LAYOUT_NOT_FOUND: {
        message: 'The requested layout does not exist',
        statusCode: 404,
    },
    PIECE_NOT_FOUND: {
        message: 'One or more of the requested pieces could not be found',
        statusCode: 404,
    },
    THEME_NOT_FOUND: {
        message: 'The requested theme does not exist',
        statusCode: 404,
    },
    PACK_NOT_FOUND: {
        message: 'The requested pack does not exist',
        statusCode: 404,
    },

    // Filter errors
    CANNOT_SEARCH_QUERY: {
        message:
            "The 'id', 'details.name', 'details.description' and if not layouts: 'categories' fields are required when the 'query' argument is used",
        statusCode: 400,
    },
    CANNOT_FILTER_NSFW: {
        message: "The 'categories' field is required when the 'nsfw' argument is used",
        statusCode: 400,
    },
    CANNOT_FILTER_CREATORS: {
        message: "The 'creator.id' field is required when the 'creators' argument is used",
        statusCode: 400,
    },
    CANNOT_FILTER_LAYOUTS: {
        message: "The 'layout.id' field is required when the 'layouts' argument is used",
        statusCode: 400,
    },

    INVALID_SORT: {
        message: "The sort argument value may only be 'downloads', 'likes', 'updated' or 'id' (default)",
        statusCode: 400,
    },
    CANNOT_SORT_BY_DOWNLOADS: {
        message: "The 'dl_count' field is required required when sorting by 'downloads'",
        statusCode: 400,
    },
    CANNOT_SORT_BY_LIKES: {
        message: "The 'like_count' field is required required when sorting by 'likes'",
        statusCode: 400,
    },
    CANNOT_SORT_BY_UPDATED: {
        message: "The 'last_updated' field is required required when sorting by 'updated' + 'asc'",
        statusCode: 400,
    },
    INVALID_ORDER: {
        message: "The order argument value may only be 'asc' or 'desc'",
        statusCode: 400,
    },

    // DB errors
    DB_SAVE_ERROR: {
        message: 'Failed saving data to DB',
        statusCode: 500,
    },
};
