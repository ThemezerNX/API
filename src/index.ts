require('dotenv').config()
const consola = require('consola')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const { ApolloServer } = require('apollo-server-express')
const resolvers = require('./endpoints/resolvers')
import typeDefs from './endpoints/typeDefs'
const { makeExecutableSchema } = require('graphql-tools')

const { errorName, errorType } = require('./util/errorTypes')
const getErrorCode = (errorName) => errorType[errorName]

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const schema = makeExecutableSchema({
	typeDefs,
	resolvers
})

interface error {
	message: String
	statusCode: Number
}

const server = new ApolloServer({
	schema,
	playground:
		process.env.NODE_ENV === 'development'
			? {
					settings: {
						'request.credentials': 'same-origin'
					}
			  }
			: false,
	formatError: (err) => {
		let error: error = null

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

app.get(/\/.+/, function(req, res) {
	res.send('No frii gaems here')
})

server.applyMiddleware({
	app,
	path: '/'
})

const port = process.env.PORT
const host = process.env.HOST

app.listen({ port, host }, () => {
	consola.ready({
		message: `🚀 Server ready at http://${host}:${port}${server.graphqlPath}`,
		badge: true
	})
})
