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

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.use(express.urlencoded({extended: true}) as express.RequestHandler);
    app.use(express.json({limit: "50mb"}) as express.RequestHandler);
    app.useGlobalPipes(new ValidationPipe());
    app.use(i18n.init);

    const port = process.env.PORT;
    const host = process.env.HOST;
    const path = "/";
    await app.listen(4100, () => {
        console.log(`🚀 Server ready at http://${host}:${port}${path}`);
    });
}

bootstrap().then();
