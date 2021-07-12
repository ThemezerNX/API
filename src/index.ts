require("dotenv").config();
const consola = require("consola");
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const {I18n} = require("i18n");
const path = require("path");
const fs = require("fs");

const {ApolloServer/*, gql, SchemaDirectiveVisitor*/} = require("apollo-server-express");
// const { defaultFieldResolver } = require('graphql')
import responseCachePlugin from "apollo-server-plugin-response-cache";
import resolvers from "./endpoints/resolvers";
import typeDefs from "./endpoints/typeDefs";
import joinMonsterAdapt from "join-monster-graphql-tools-adapter";
import joinMonsterMetaData from "./endpoints/joinMonsterMetaData";
import buildContext from "./util/buildContext";

const {makeExecutableSchema} = require("graphql-tools");

const locales = fs.readdirSync(path.resolve(__dirname, "langs")).map((file) => {
    // isos: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
    return path.basename(file, ".json");
});

const i18n = new I18n();
i18n.configure({
    locales,
    directory: path.join(__dirname, "langs"),
    defaultLocale: "en",
    retryInDefaultLocale: true,
    mustacheConfig: {
        tags: ['{', '}'],
        disable: false
    }
});

const {errorType} = require("./util/errorTypes");
const getError = (errorName) => {
    return {key: errorName, ...errorType[errorName]};
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: "50mb"}));
app.use(i18n.init);

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

joinMonsterAdapt(schema, joinMonsterMetaData);

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

        error = getError(err.message);
        if (error) {
            return error;
        } else if (err.message.includes("Cannot query field")) {
            const fieldREGEX = /".*?"/;
            return getError("INVALID_FIELD")(fieldREGEX.exec(err.message)[0].replace(/"/g, ""), "");
        }

        return err;
    },
    formatResponse: (response, request, res) => {
        if (response?.data && request?.context?.pagination) {
            response.data.pagination = request.context.pagination;
        }

        if (response?.data?.nxinstaller) {
            response.data = response?.data?.nxinstaller;
        }

        // localize errors
        if (response?.errors) {
            const $t = request.context.req.res.__;

            response.errors = response.errors.map((err) => {
                if (!err.key) return err;

                return {
                    statusCode: err.statusCode,
                    key: err.key,
                    message: $t(err.key, err.i18nParams),
                };
            });
        }

        return response;
    },
});

if (process.env.NODE_ENV === "development") {
    app.use(
        cors({
            credentials: false,
            origin: process.env.NODE_ENV === "development" ? process.env.WEBSITE_ENDPOINT : null,
        }),
    );
    app.use("/cdn", express.static("../cdn"));
} else {
    app.use(
        cors({
            credentials: true,
        }),
    );
}

app.get(/\/.+/, function (req, res) {
    res.send("No frii gaems here");
});

server.applyMiddleware({
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
