require('dotenv').config()
const consola = require('consola')
const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
import cookieParser from 'cookie-parser'

const { ApolloServer } = require('apollo-server-express')
import resolvers from './endpoints/resolvers'
import typeDefs from './endpoints/typeDefs'
const { makeExecutableSchema } = require('graphql-tools')

const { errorType } = require('./util/errorTypes')
const getErrorCode = (errorName) => errorType[errorName]

import buildContext from './util/buildContext'

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))

const schema = makeExecutableSchema({
	typeDefs,
	resolvers
})

const server = new ApolloServer({
	uploads: {
		maxFileSize: 25000000, // 25 MB
		maxFiles: 50
	},
	schema,
	context: async ({ req }) => buildContext({ req }),
	playground:
		process.env.NODE_ENV === 'development'
			? {
					settings: {
						'request.credentials': 'same-origin'
					}
			  }
			: false,
	formatError: (err, params) => {
		let error = null
		console.error(err)

		error = getErrorCode(err.message)
		if (error) {
			return error
		} else if (err.message.includes('Cannot query field')) {
			const fieldREGEX = /".*?"/
			return getErrorCode('INVALID_FIELD')(fieldREGEX.exec(err.message)[0].replace(/"/g, ''), '')
		}

		return err
	}
})

app.get('/logout', function(req, res) {
	req.logout()
	req.session.destroy()
	res.redirect('/')
})

app.get(/\/.+/, function(req, res) {
	res.send('No frii gaems here')
})

server.applyMiddleware({
	cors: {
		credentials: true,
		origin: process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : 'https://themezer.ga'
	},
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
