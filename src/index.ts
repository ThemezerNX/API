import * as dotenv from "dotenv";
import "reflect-metadata";
import {ApolloServer} from "apollo-server-express";
import {buildSchema} from "type-graphql";
import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import {I18n} from "i18n";
import {createConnection} from "typeorm";
import resolvers from "./resolvers";

dotenv.config();

const locales = fs.readdirSync(path.resolve(__dirname, "lang")).map((file) => {
    // isos: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
    return path.basename(file, ".json");
});

const i18n = new I18n();
i18n.configure({
    locales,
    directory: path.join(__dirname, "lang"),
    defaultLocale: "en",
    retryInDefaultLocale: true,
    mustacheConfig: {
        tags: ["{", "}"],
        disable: false,
    },
});

const main = async () => {
    await createConnection();

    const schema = await buildSchema({resolvers});

    const apolloServer = new ApolloServer({
        schema,
        uploads: {
            maxFileSize: 25000000, // 25 MB
            maxFiles: 50,
        },
        introspection: true,
        playground:
            process.env.NODE_ENV === "development"
                ? {settings: {"request.credentials": "same-origin"}}
                : false,
    });

    const app = express();
    app.use(express.urlencoded({extended: true}) as express.RequestHandler);
    app.use(express.json({limit: "50mb"}) as express.RequestHandler);
    app.use(i18n.init);

    app.get(/\/.+/, function (req, res) {
        res.send("No frii gaems here");
    });

    const port = process.env.PORT;
    const host = process.env.HOST;
    const path = "/";
    apolloServer.applyMiddleware({app, path});
    app.listen({port, host}, () => {
        console.log(`🚀 Server ready at http://${host}:${port}${path}`);
    });

};

main();