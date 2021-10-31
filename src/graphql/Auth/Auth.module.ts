import {Module} from "@nestjs/common";
import {LocalStrategy} from "./Strategies/Local/strategy/Local.strategy";
import {AuthService} from "./Auth.service";
import {AuthResolver} from "./Auth.resolver";
import {LocalLoginGuard} from "./Strategies/Local/strategy/LocalLogin.guard";
import {SessionSerializer} from "./Session.serializer";
import {PassportModule} from "@nestjs/passport";
import {UserModule} from "../User/User.module";
import {GqlAuthGuard} from "./GqlAuth.guard";
import {MailModule} from "../../mail/mail.module";
import {ThemeModule} from "../Theme/Theme.module";
import {HBThemeModule} from "../HBTheme/HBTheme.module";
import {PackModule} from "../Pack/Pack.module";
import {LayoutModule} from "../Layout/Layout.module";
import {APP_GUARD} from "@nestjs/core";

@Module({
    imports: [
        UserModule,
        MailModule,
        ThemeModule,
        HBThemeModule,
        PackModule,
        LayoutModule,
        PassportModule.register({
            defaultStrategy: "local",
            session: true,
        }),
    ],
    providers: [
        AuthResolver,
        AuthService,
        LocalStrategy,
        SessionSerializer,
        LocalLoginGuard,
        {
            provide: APP_GUARD,
            useClass: GqlAuthGuard,
        },
    ],
})
export class AuthModule {
}