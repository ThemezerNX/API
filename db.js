const pgPromise = require('pg-promise')

const pgp = pgPromise({ capSQL: true }) // Empty object means no additional config required

const config = {
	host: process.env.POSTGRES_HOST,
	port: process.env.POSTGRES_PORT,
	database: process.env.POSTGRES_DB,
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD
}
const db = pgp(config)

exports.pgp = pgp
exports.db = db
