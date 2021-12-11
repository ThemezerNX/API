import {ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule} from "@nestjs/common";
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
import {Connection, createConnection, getConnectionOptions, QueryRunner} from "typeorm";
import {LayoutOptionModule} from "./LayoutOption/LayoutOption.module";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {ThemeHashEntity} from "./Cache/Theme/ThemeHash.entity";
import {HBThemeHashEntity} from "./Cache/HBTheme/HBThemeHash.entity";
import {PackHashEntity} from "./Cache/Pack/PackHash.entity";
import {UserEntity} from "./User/User.entity";
import {UserConnectionsEntity} from "./User/Connections/UserConnections.entity";
import {UserPreferencesEntity} from "./User/Preferences/UserPreferences.entity";
import {UserProfileEntity} from "./User/Profile/UserProfile.entity";

async function dropViews(queryRunner: QueryRunner) {
    const phm = PackHashEntity.getRepository().metadata;
    if (await queryRunner.getView(phm.tableName)) await queryRunner.dropView(phm.tableName);

    const thm = ThemeHashEntity.getRepository().metadata;
    if (await queryRunner.getView(thm.tableName)) await queryRunner.dropView(thm.tableName);

    const hbthm = HBThemeHashEntity.getRepository().metadata;
    if (await queryRunner.getTable(hbthm.tableName)) await queryRunner.dropView(hbthm.tableName);
}

async function insertDefaults(connection: Connection) {
    const unknownUser = UserEntity.create({counter: -0, username: "unknown", isVerified: true, roles: ["system"]});
    unknownUser.connections = new UserConnectionsEntity();
    unknownUser.preferences = new UserPreferencesEntity();
    unknownUser.profile = new UserProfileEntity();

    const nintendoUser = UserEntity.create({counter: -1, username: "Nintendo", isVerified: true, roles: ["system"]});
    nintendoUser.connections = new UserConnectionsEntity();
    nintendoUser.preferences = new UserPreferencesEntity();
    nintendoUser.profile = new UserProfileEntity();

    await connection.createQueryBuilder()
        .insert()
        // .into(UserEntity, ["counter", "username", "isVerified", "roles"])
        .into(UserEntity)
        .values([unknownUser, nintendoUser])
        .orIgnore()
        .execute()
}


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
            introspection: true,
            autoSchemaFile: process.env.NODE_ENV == "development" ? "schema.gql" : false,
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
                    synchronize: false,
                }),
            connectionFactory: async (options) => {
                const connection = await createConnection(options);

                // 1. drop all views/mviews, as typeorm cannot drop them in correct order nor does cascade drop.
                const queryRunner = await connection.createQueryRunner();

                if (true) {
                    if (process.env.NODE_ENV == "development") {
                        await dropViews(queryRunner);
                        await connection.synchronize(false);
                        await insertDefaults(connection);
                    } else {
                        await connection.runMigrations();
                    }
                }

                return connection;
            },
        }),
        UserModule,
        ThemeModule,
        HBThemeModule,
        PackModule,
        LayoutModule,
        LayoutOptionModule,
        ThemeTagModule,
        NXInstallerModule,
        AuthModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: ClassSerializerInterceptor,
        },
    ],
})
export class GraphqlModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(graphqlUploadExpress()).forRoutes("/graphql");
    }
}
