module.exports = {
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    schema: process.env.POSTGRES_SCHEMA,
    logging: process.env.NODE_ENV === "development",
    synchronize: process.env.NODE_ENV === "development" && true,
    entities: ["./src/entities/**/*.ts"],
};
