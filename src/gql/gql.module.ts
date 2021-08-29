import {MiddlewareConsumer, Module, NestModule} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {I18nJsonParser, I18nModule} from "nestjs-i18n";
import * as path from "path";
import {UserModule} from "./User/User.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {graphqlUploadExpress} from "graphql-upload";
import {GraphQLModule} from "@nestjs/graphql";
import {ThemeModule} from "./Theme/Theme.module";
import {PackModule} from "./Pack/Pack.module";
import {LayoutModule} from "./Layout/Layout.module";
import {HBThemeModule} from "./HBTheme/HBTheme.module";
import {EntityNamingStrategy} from "./common/EntityNamingStrategy";
import {ThemeTagModule} from "./ThemeTag/ThemeTag.module";
import {NXInstallerModule} from "./NXInstaller/NXInstaller.module";

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
            // https://github.com/nestjs/graphql/issues/901#issuecomment-780007582
            uploads: false,
            // authChecker,
            formatResponse: (response, requestContext) => {
                if (response?.data?.nxinstaller) {
                    response.data = response?.data?.nxinstaller;
                }

                // localize errors
                if (response?.errors) {
                    const $t = (requestContext.context as any).req.__;

                    response.errors = response.errors.map((err) => {
                        const ex = err.extensions.exception;

                        if (ex.isTranslatable) {
                            const newError = {
                                statusCode: ex.statusCode,
                                ...err,
                                message: $t(ex.langKey, ex.i18nParams),
                            };

                            delete ex.isTranslatable;
                            delete ex.i18nParams;

                            return newError;
                        }

                        return err;
                    });
                }

                return response;
            },
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
        NXInstallerModule,
    ],
})
export class GqlModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(graphqlUploadExpress()).forRoutes("/");
    }
}
