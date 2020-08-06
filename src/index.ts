require('dotenv').config()
const consola = require('consola')
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')

const { ApolloServer } = require('apollo-server-express')
import responseCachePlugin from 'apollo-server-plugin-response-cache'
import resolvers from './endpoints/resolvers'
import typeDefs from './endpoints/typeDefs'
const { makeExecutableSchema } = require('graphql-tools')

import joinMonsterAdapt from 'join-monster-graphql-tools-adapter'
import joinMonsterMetaData from './endpoints/joinMonsterMetaData'

const { errorType } = require('./util/errorTypes')
const getErrorCode = (errorName) => errorType[errorName]

import buildContext from './util/buildContext'

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))

const schema = makeExecutableSchema({
	typeDefs,
	resolvers
})

joinMonsterAdapt(schema, joinMonsterMetaData)

const server = new ApolloServer({
	uploads: {
		maxFileSize: 25000000, // 25 MB
		maxFiles: 50
	},
	cacheControl:
		process.env.NODE_ENV === 'development'
			? false
			: {
					defaultMaxAge: 20
			  },
	plugins: [
		responseCachePlugin({
			sessionId: (context) => context.request.http.headers.get('token') || null
		})
	],
	schema,
	context: async ({ req }) => buildContext({ req }),
	introspection: true,
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
	},

	formatResponse: (response, requestContext) => {
		if (response?.data && requestContext?.context?.pagination) {
			response.data.pagination = requestContext.context.pagination
		}

		if (response?.data?.nxinstaller) {
			response.data = response?.data?.nxinstaller
		}

		return response
	}
})

if (process.env.NODE_ENV === 'development') {
	app.use(
		cors({
			credentials: false,
			origin: process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : 'https://themezer.ga'
		})
	)
	app.use('/cdn', express.static('../cdn'))
}

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
