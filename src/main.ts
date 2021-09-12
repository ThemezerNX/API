import "reflect-metadata";
import * as dotenv from "dotenv";
import * as express from "express";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {NestExpressApplication} from "@nestjs/platform-express";
import {ValidationPipe} from "@nestjs/common";
import {I18n} from "i18n";
import * as fs from "fs";
import * as path from "path";
import * as cookieparser from "cookie-parser";
import * as expressSession from "express-session";
import * as passport from "passport";
import {TypeormStore} from "connect-typeorm";
import {SessionEntity} from "./session/Session.entity";

dotenv.config();

const locales = fs.readdirSync(path.resolve(__dirname, "../lang")).map((file) => {
    // isos: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
    return path.basename(file, ".json");
});

const i18n = new I18n();
i18n.configure({
    locales,
    directory: path.resolve(__dirname, "lang"),
    defaultLocale: "en",
    retryInDefaultLocale: true,
    mustacheConfig: {
        tags: ["{", "}"],
        disable: false,
    },
});

const SESSION_AGE = 365 * 24 * 60 * 60; // 365 days in seconds

function configurePassport(app: NestExpressApplication) {
    app.use(cookieparser());

    app.use(expressSession({
        store: new TypeormStore({
            cleanupLimit: 2,
            limitSubquery: false,
            ttl: SESSION_AGE,
        }).connect(SessionEntity.getRepository()),
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: SESSION_AGE * 1000, // milliseconds
            domain: process.env.DOMAIN,
            secure: process.env.NODE_ENV == "production",
        },
    }));

    app.use(passport.initialize());
    app.use(passport.session());
}

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.use(express.urlencoded({extended: true}) as express.RequestHandler);
    app.use(express.json({limit: "50mb"}) as express.RequestHandler);
    app.useGlobalPipes(new ValidationPipe());
    app.use(i18n.init);
    configurePassport(app);

    app.use((req, res, next) => {
        req.getClientIP = () => {
            return req?.headers["cf-connecting-ip"] || req?.headers["x-forwarded-for"] || req?.ip || req?.connection.remoteAddress;
        };
        next();
    });

    const port = process.env.PORT;
    const host = process.env.HOST;
    await app.listen(4100, () => {
        console.log(`🚀 Server ready at http://${host}:${port}/`);
    });
}

bootstrap().then();
