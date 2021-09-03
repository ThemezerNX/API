const tsquery = require("pg-tsquery")({negated: /\s[!-]$/});

export const toTsQuery = (query: string) => {
    return tsquery(query + "*");
};
