import {Module} from "@nestjs/common";
import {GraphqlModule} from "./graphql/graphql.module";
import {MailModule} from "./mail/mail.module";
import {RestModule} from "./rest/rest.module";
import {WebhookModule} from "./webhook/Webhook.module";


@Module({
    imports: [
        RestModule,
        GraphqlModule,
        MailModule,
        WebhookModule,
    ],
})
export class AppModule {
}
