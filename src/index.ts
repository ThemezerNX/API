require('dotenv').config()
const consola = require('consola')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const { ApolloServer } = require('apollo-server-express')
import resolvers from './endpoints/resolvers'
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

const server = new ApolloServer({
	uploads: {
		maxFileSize: 10000000, // 10 MB
		maxFiles: 4
	},
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
		let error = null
		console.error(err)

		if (getErrorCode(err.message)) {
			error = getErrorCode(err.message)
			return {
				message: error.message,
				statusCode: error.statusCode
			}
		} else if (err.message.includes('Cannot query field')) {
			const fieldREGEX = /".*?"/
			error = getErrorCode('INVALID_FIELD')(fieldREGEX.exec(err.message)[0].replace(/"/g, ''), '')
			return {
				message: error.message,
				statusCode: error.statusCode
			}
		}

		return err
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
