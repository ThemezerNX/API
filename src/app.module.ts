import {Module} from "@nestjs/common";
import {RestModule} from "./rest/rest.module";
import {GraphqlModule} from "./graphql/graphql.module";
import {MailModule} from "./mail/mail.module";


@Module({
    imports: [
        RestModule,
        GraphqlModule,
        MailModule,
    ],
})
export class AppModule {
}
