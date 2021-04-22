const pgPromise = require("pg-promise");

const config = {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
};

const options = {
    capSQL: true,
    query: undefined,
};
if (process.env.NODE_ENV === "development") {
    options.query = (e) => {
        console.log("-----------------------------");
        console.log(e.query);
    };
}

export const pgp = pgPromise(options);
export const db = pgp(config);
