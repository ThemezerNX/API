require('dotenv').config()
const { createServer } = require('http')
const consola = require('consola')
const express = require('express')
const app = express()
const { ApolloServer } = require('apollo-server-express')
const session = require('express-session')
const PgSession = require('connect-pg-simple')(session)
const bodyParser = require('body-parser')

const joinMonsterAdapt = require('join-monster-graphql-tools-adapter')
const bcrypt = require('bcryptjs')
const { makeExecutableSchema } = require('graphql-tools')
const passport = require('passport')
const { GraphQLLocalStrategy, buildContext } = require('graphql-passport')
const joinMonsterMetadata = require('./graphql/joinMonsterMetadata')
const { pgp, db } = require('./db')
const resolvers = require('./graphql/resolvers')(pgp, db)
const typeDefs = require('./graphql/typeDefs')
const { errorName, errorType } = require('./errorTypes')
const getErrorCode = (errorName) => errorType[errorName]

passport.use(
	new GraphQLLocalStrategy((email, password, done) => {
		db.oneOrNone('SELECT * FROM users WHERE email = $1', [
			email,
			password
		]).then((res) => {
			consola.log(res)
			if (!res) {
				done(new Error(errorName.USER_NOT_EXIST), null)
			} else {
				bcrypt.compare(password, res.password_hash, function(
					bcryptErr,
					bcryptResult
				) {
					if (bcryptErr) {
						done(new Error(errorName.UNKNOWN), null)
					} else if (bcryptResult) {
						const user = {
							uuid: res.uuid,
							username: res.username,
							email: res.email,
							joined: res.joined,
							last_logged_in: res.last_logged_in,
							role: res.role
						}
						done(null, user)
					} else {
						done(new Error(errorName.USER_PASSWORD_INCORRECT), null)
					}
				})
			}
		})
	})
)

passport.serializeUser((user, done) => {
	done(null, user)
})

passport.deserializeUser((user, done) => {
	db.oneOrNone('SELECT * FROM users WHERE uuid = $1', [user.uuid]).then(
		(res) => {
			if (!res) {
				done(new Error('User Not Logged in, session error'), null)
			} else {
				done(null, user)
			}
		}
	)
})

app.use(
	session({
		store: new PgSession({
			pgPromise: db,
			tableName: 'sessions'
		}),
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		// cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
		cookie: { expires: new Date(253402300000000) } // 2099
	})
)

app.use(passport.initialize())
app.use(passport.session())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const schema = makeExecutableSchema({
	typeDefs,
	resolvers
})

const server = new ApolloServer({
	// Options: https://www.apollographql.com/docs/apollo-server/api/apollo-server/
	schema,
	context: ({ req, res }) => buildContext({ req, res }),
	playground: {
		settings: {
			'request.credentials': 'same-origin'
		}
	},
	formatError: (err) => {
		consola.error(err.message)
		let error = ''

		if (getErrorCode(err.message)) {
			error = getErrorCode(err.message)
		} else if (err.message.includes('Cannot query field')) {
			const fieldREGEX = /".*?"/
			error = getErrorCode('INVALID_FIELD')(
				fieldREGEX.exec(err.message)[0].replace(/"/g, ''),
				''
			)
		} else {
			error = getErrorCode('UNKNOWN')
		}
		return {
			message: error.message,
			statusCode: error.statusCode
		}
	}
})

server.applyMiddleware({ app })

const httpServer = createServer(app)

async function start() {
	joinMonsterAdapt(schema, joinMonsterMetadata)

	app.get('/', function(req, res) {
		res.send('No frii gaems here')
	})

	app.get('/logout', function(req, res) {
		req.logout()
		req.session.destroy()
		res.redirect('/')
	})

	// app.get('/account/activate/:uuid/:email', function(req, res) {
	//     const activationUuid = req.params.uuid
	//     const activationEmail = req.params.uuid

	//     db.one('SELECT * FROM users WHERE uuid = $1', [activationUuid]).then(
	//         (res) => {
	//             // consola.log(res)
	//             if (!res) {
	//                 done(new Error('User Not Logged in, session error'), null)
	//             } else {
	//                 bcrypt.compare(res.email, activationEmail, function(
	//                     bcryptErr,
	//                     bcryptResult
	//                 ) {
	//                     if (bcryptErr) {
	//                         new Error(errorName.UNKNOWN)
	//                     } else if (bcryptResult) {
	//                     } else {
	//                         done(
	//                             new Error(errorName.USER_PASSWORD_INCORRECT),
	//                             null
	//                         )
	//                     }
	//                 })
	//             }
	//         }
	//     )
	// })

	const port = 4100
	const host = 'localhost'

	httpServer.listen({ port, host }, () => {
		consola.ready({
			message: `🚀 Server ready at http://${host}:${port}${server.graphqlPath}`,
			badge: true
		})
	})
}
start()
