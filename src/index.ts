require("dotenv").config();
const consola = require("consola");
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const {ApolloServer/*, gql, SchemaDirectiveVisitor*/} = require("apollo-server-express");
// const { defaultFieldResolver } = require('graphql')
import responseCachePlugin from "apollo-server-plugin-response-cache";
import resolvers from "./endpoints/resolvers";
import typeDefs from "./endpoints/typeDefs";
import joinMonsterAdapt from "join-monster-graphql-tools-adapter";
import joinMonsterMetaData from "./endpoints/joinMonsterMetaData";
import buildContext from "./util/buildContext";

const {makeExecutableSchema} = require("graphql-tools");

const {errorType} = require("./util/errorTypes");
const getErrorCode = (errorName) => errorType[errorName];

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: "50mb"}));

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

joinMonsterAdapt(schema, joinMonsterMetaData);

/*class AuthDirective extends SchemaDirectiveVisitor {
 visitObject(type) {
 this.ensureFieldsWrapped(type)
 type._requiredAuthRole = this.args.requires
 }
 // Visitor methods for nested types like fields and arguments
 // also receive a details object that provides information about
 // the parent and grandparent types.
 visitFieldDefinition(field, details) {
 this.ensureFieldsWrapped(details.objectType)
 field._requiredAuthRole = this.args.requires
 }

 ensureFieldsWrapped(objectType) {
 // Mark the GraphQLObjectType object to avoid re-wrapping:
 if (objectType._authFieldsWrapped) return
 objectType._authFieldsWrapped = true

 const fields = objectType.getFields()

 Object.keys(fields).forEach((fieldName) => {
 const field = fields[fieldName]
 const { resolve = defaultFieldResolver } = field
 field.resolve = async function(...args) {
 // Get the required Role from the field first, falling back
 // to the objectType if no Role is required by the field:
 const requiredRole = field._requiredAuthRole || objectType._requiredAuthRole

 if (!requiredRole) {
 return resolve.apply(this, args)
 }

 const context = args[2]
 if (!context.req.user.roles?.includes(requiredRole.toLowerCase())) {
 throw new Error('not authorized')
 }

 return resolve.apply(this, args)
 }
 })
 }
 }*/

const server = new ApolloServer({
    uploads: {
        maxFileSize: 25000000, // 25 MB
        maxFiles: 50,
    },
    cacheControl:
        process.env.NODE_ENV === "development"
            ? false
            : {
                defaultMaxAge: 20,
            },
    plugins: [
        responseCachePlugin({
            sessionId: (context) => context.request.http?.headers.get("token") || null,
        }),
    ],
    schema,
    /*	schemaDirectives: {
     auth: AuthDirective
     },*/
    context: async ({req}) => buildContext({req}),
    introspection: true,
    playground:
        process.env.NODE_ENV === "development"
            ? {
                settings: {
                    "request.credentials": "same-origin",
                },
            }
            : false,
    formatError: (err, _params) => {
        let error: null;
        console.error(err);

        error = getErrorCode(err.message);
        if (error) {
            return error;
        } else if (err.message.includes("Cannot query field")) {
            const fieldREGEX = /".*?"/;
            return getErrorCode("INVALID_FIELD")(fieldREGEX.exec(err.message)[0].replace(/"/g, ""), "");
        }

        return err;
    },

    formatResponse: (response, requestContext) => {
        if (response?.data && requestContext?.context?.pagination) {
            response.data.pagination = requestContext.context.pagination;
        }

        if (response?.data?.nxinstaller) {
            response.data = response?.data?.nxinstaller;
        }

        return response;
    },
});

if (process.env.NODE_ENV === "development") {
    app.use(
        cors({
            credentials: false,
            origin: process.env.NODE_ENV === "development" ? "http://localhost:4000" : process.env.WEBSITE_ENDPOINT,
        }),
    );
    app.use("/cdn", express.static("../cdn"));
}

app.get(/\/.+/, function (req, res) {
    res.send("No frii gaems here");
});

server.applyMiddleware({
    cors: {
        credentials: true,
        origin: process.env.NODE_ENV === "development" ? "http://localhost:4000" : process.env.WEBSITE_ENDPOINT,
    },
    app,
    path: "/",
});

const port = process.env.PORT;
const host = process.env.HOST;

app.listen({port, host}, async () => {
    consola.ready({
        message: `🚀 Server ready at http://${host}:${port}${server.graphqlPath}`,
        badge: true,
    });
});
