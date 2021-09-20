export const errorName = {
    UNKNOWN: "UNKNOWN",
    SUBMISSIONS_DISABLED: "SUBMISSIONS_DISABLED",
    INVALID_FIELD: "INVALID_FIELD",

    UNAUTHORIZED: "UNAUTHORIZED",
    SUBMITTING_BLOCKED: "SUBMITTING_BLOCKED",
    ALREADY_AUTHORIZED: "ALREADY_AUTHORIZED",
    AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
    NO_CONTENT: "NO_CONTENT",

    CREATOR_NOT_EXIST: "CREATOR_NOT_EXIST",

    FILE_READ_ERROR: "FILE_READ_ERROR",
    FILE_SAVE_ERROR: "FILE_SAVE_ERROR",
    FILE_TOO_BIG: "FILE_TOO_BIG",
    MAX_50_NXTHEMES: "MAX_50_NXTHEMES",
    INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
    INVALID_SCREENSHOT_DIMENSIONS: "INVALID_SCREENSHOT_DIMENSIONS",
    NOT_A_SCREENSHOT: "NOT_A_SCREENSHOT",
    INVALID_TMP: "INVALID_TMP",
    INVALID_ID: "INVALID_ID",
    INVALID_TARGET_NAME: "INVALID_TARGET_NAME",
    INVALID_TARGET_NAME_CHECK_LAYOUT: "INVALID_TARGET_NAME_CHECK_LAYOUT",
    TARGETS_DONT_MATCH: "TARGETS_DONT_MATCH",
    NO_COMMON_ALLOWED: "NO_COMMON_ALLOWED",
    INVALID_CATEGORY_AMOUNT: "INVALID_CATEGORY_AMOUNT",
    INVALID_NXTHEME_CONTENTS: "INVALID_NXTHEME_CONTENTS",
    ZIP_READ_ERROR: "ZIP_READ_ERROR",
    NO_VALID_NXTHEMES: "NO_VALID_NXTHEMES",
    NO_NXTHEMES_IN_ZIP: "NO_NXTHEMES_IN_ZIP",

    NXTHEME_CREATE_FAILED: "NXTHEME_CREATE_FAILED",
    NXTHEME_UNPACK_FAILED: "NXTHEME_UNPACK_FAILED",
    PACK_CREATE_FAILED: "PACK_CREATE_FAILED",

    NXINSTALLER_ID_INVALID: "NXINSTALLER_ID_INVALID",

    LAYOUT_NOT_FOUND: "LAYOUT_NOT_FOUND",
    PIECE_NOT_FOUND: "PIECE_NOT_FOUND",
    THEME_NOT_FOUND: "THEME_NOT_FOUND",
    PACK_NOT_FOUND: "PACK_NOT_FOUND",

    INVALID_SORT: "INVALID_SORT",
    INVALID_ORDER: "INVALID_ORDER",

    DB_SAVE_ERROR: "DB_SAVE_ERROR",
};

export const errorType = {
    UNKNOWN: {
        statusCode: 500,
    },
    SUBMISSIONS_DISABLED: {
        statusCode: 500,
    },
    INVALID_FIELD(field, type) {
        return {
            message: `Field '${field}' cannot be queried on type` + (type ? ` ${type}` : ""),
            statusCode: 1,
        };
    },

    // Status
    UNAUTHORIZED: {
        statusCode: 401,
    },
    SUBMITTING_BLOCKED: {
        statusCode: 401,
    },
    ALREADY_AUTHORIZED: {
        statusCode: 402,
    },
    AUTHORIZATION_ERROR: {
        statusCode: 403,
    },
    NO_CONTENT: {
        statusCode: 204,
    },

    // Creator messages
    CREATOR_NOT_EXIST: {
        statusCode: 404,
    },

    // Themes
    FILE_READ_ERROR: {
        statusCode: 4000,
    },
    FILE_SAVE_ERROR: {
        statusCode: 4001,
    },
    FILE_TOO_BIG: {
        statusCode: 4002,
    },
    MAX_50_NXTHEMES: {
        statusCode: 4003,
    },
    INVALID_FILE_TYPE: {
        statusCode: 4004,
    },
    INVALID_SCREENSHOT_DIMENSIONS: {
        i18nParams: {
            size: "1280×720",
        },
        statusCode: 4011,
    },
    NOT_A_SCREENSHOT: {
        statusCode: 4012,
    },
    INVALID_TMP: {
        statusCode: 4005,
    },
    INVALID_ID: {
        statusCode: 4006,
    },
    INVALID_TARGET_NAME: {
        i18nParams: {
            param1: "targetName",
        },
        statusCode: 4007,
    },
    INVALID_TARGET_NAME_CHECK_LAYOUT: {
        i18nParams: {
            param1: "targetName",
        },
        statusCode: 4007,
    },
    TARGETS_DONT_MATCH: {
        statusCode: 4008,
    },
    NO_COMMON_ALLOWED: {
        statusCode: 4009,
    },
    INVALID_CATEGORY_AMOUNT: {
        i18nParams: {
            param1: "categories",
            min: 1,
            max: 10,
        },
        statusCode: 4010,
    },

    INVALID_NXTHEME_CONTENTS: {
        statusCode: 4100,
    },
    ZIP_READ_ERROR: {
        statusCode: 4101,
    },
    NO_VALID_NXTHEMES: {
        statusCode: 4102,
    },
    NO_NXTHEMES_IN_ZIP: {
        statusCode: 4103,
    },

    NXTHEME_CREATE_FAILED: {
        statusCode: 4200,
    },
    NXTHEME_UNPACK_FAILED: {
        statusCode: 4201,
    },
    PACK_CREATE_FAILED: {
        statusCode: 4202,
    },

    NXINSTALLER_ID_INVALID: {
        i18nParams: {
            param1: "p",
            param2: "t",
        },
        statusCode: 4300,
    },

    LAYOUT_NOT_FOUND: {
        statusCode: 404,
    },
    PIECE_NOT_FOUND: {
        statusCode: 404,
    },
    THEME_NOT_FOUND: {
        statusCode: 404,
    },
    PACK_NOT_FOUND: {
        statusCode: 404,
    },

    // Filter errors
    INVALID_SORT: {
        i18nParams: {
            param1: "downloads",
            param2: "likes",
            param3: "updated",
            param4: "id",
        },
        statusCode: 400,
    },
    INVALID_ORDER: {
        i18nParams: {
            param1: "asc",
            param2: "desc",
        },
        statusCode: 401,
    },

    // DB errors
    DB_SAVE_ERROR: {
        statusCode: 500,
    },
};
