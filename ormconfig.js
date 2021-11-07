const {EntityNamingStrategy} = require("./dist/src/graphql/common/EntityNamingStrategy");
const {TypeOrmLogger} = require("./dist/src/graphql/common/loggers/TypeOrmLogger");


module.exports = {
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    schema: process.env.POSTGRES_SCHEMA,
    logger: new TypeOrmLogger(process.env.NODE_ENV === "development"),
    synchronize: process.env.NODE_ENV === "development" && true,
    entities: ["./dist/**/*.entity.js"],
    migrations: ["./dist/migrations/*.js"],
    namingStrategy: new EntityNamingStrategy(),
    cli: { migrationsDir: "migrations" },
    migrationsTransactionMode: "each"
}