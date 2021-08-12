import * as dotenv from "dotenv";
import {ApolloServer} from "apollo-server-express";
import {buildSchema, Query, Resolver} from "type-graphql";
import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import {I18n} from "i18n";

dotenv.config();

@Resolver()
class TestResolver {
    @Query(() => String)
    async hello() {
        return "HELLO";
    }
}

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
        tags: ["{", "}"],
        disable: false,
    },
});

const main = async () => {
    const schema = await buildSchema({
        resolvers: [TestResolver],
    });

    const apolloServer = new ApolloServer({schema});

    const app = express();
    app.use(express.urlencoded({extended: true}) as express.RequestHandler);
    app.use(express.json({limit: "50mb"}) as express.RequestHandler);
    app.use(i18n.init);

    app.get(/\/.+/, function (req, res) {
        res.send("No frii gaems here");
    });

    apolloServer.applyMiddleware({app, path: "/"});

    const port = process.env.PORT;
    const host = process.env.HOST;
    app.listen({port, host}, () => {
        console.log(`🚀 Server ready at http://${host}:${port}${server.graphqlPath}`);
    });

};

main();