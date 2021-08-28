import "reflect-metadata";
import * as dotenv from "dotenv";
import * as express from "express";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {NestExpressApplication} from "@nestjs/platform-express";
import {ValidationPipe} from "@nestjs/common";

dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.use(express.urlencoded({extended: true}) as express.RequestHandler);
    app.use(express.json({limit: "50mb"}) as express.RequestHandler);
    app.useGlobalPipes(new ValidationPipe());

    const port = process.env.PORT;
    const host = process.env.HOST;
    const path = "/";
    await app.listen(4100, () => {
        console.log(`🚀 Server ready at http://${host}:${port}${path}`);
    });
}

bootstrap().then();
