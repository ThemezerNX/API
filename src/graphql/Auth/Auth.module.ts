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

@Module({
    imports: [
        UserModule,
        MailModule,
        PassportModule.register({
            defaultStrategy: "local",
            session: true,
        }),
    ],
    providers: [AuthResolver, AuthService, LocalStrategy, SessionSerializer, LocalLoginGuard, GqlAuthGuard],
})
export class AuthModule {
}