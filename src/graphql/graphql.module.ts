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
import {ThemeTagModule} from "./ThemeTag/ThemeTag.module";
import {AuthModule} from "./Auth/Auth.module";
import {NXInstallerModule} from "./NXInstaller/NXInstaller.module";
import {getConnectionOptions} from "typeorm";

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

                        if (ex?.isTranslatable) {
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
        TypeOrmModule.forRootAsync({
            useFactory: async () =>
                Object.assign(await getConnectionOptions(), {
                    autoLoadEntities: true,
                    keepConnectionAlive: true,
                }),
        }),
        UserModule,
        ThemeModule,
        HBThemeModule,
        PackModule,
        LayoutModule,
        ThemeTagModule,
        NXInstallerModule,
        AuthModule,
    ],
})
export class GraphqlModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(graphqlUploadExpress()).forRoutes("/");
    }
}
