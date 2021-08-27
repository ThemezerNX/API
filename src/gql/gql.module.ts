import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {I18nJsonParser, I18nModule} from "nestjs-i18n";
import * as path from "path";
import {UserModule} from "./User/User.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {GraphQLModule} from "@nestjs/graphql";
import {ThemeModule} from "./Theme/Theme.module";
import {PackModule} from "./Pack/Pack.module";
import {LayoutModule} from "./Layout/Layout.module";
import {HBThemeModule} from "./HBTheme/HBTheme.module";
import {EntityNamingStrategy} from "./common/EntityNamingStrategy";
import {ThemeTagModule} from "./ThemeTag/ThemeTag.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        I18nModule.forRoot({
            fallbackLanguage: "en",
            parser: I18nJsonParser,
            parserOptions: {
                path: path.join(__dirname, "/../lang/"),
            },
        }),
        GraphQLModule.forRoot({
            path: "/",
            introspection: true,
            autoSchemaFile: true,
            // authChecker,
            context: ({req, connection}) =>
                connection
                    ? {req: connection.context, currentUser: req.user}
                    : {req, currentUser: req.user}
            ,
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT),
            database: process.env.POSTGRES_DB,
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            schema: process.env.POSTGRES_SCHEMA,
            logging: process.env.NODE_ENV === "development",
            synchronize: process.env.NODE_ENV === "development" && true,
            entities: ["./dist/**/*.entity.js"],
            autoLoadEntities: true,
            keepConnectionAlive: true,
            namingStrategy: new EntityNamingStrategy(),
        }),
        UserModule,
        ThemeModule,
        HBThemeModule,
        PackModule,
        LayoutModule,
        ThemeTagModule,
    ],
})
export class GqlModule {
}
