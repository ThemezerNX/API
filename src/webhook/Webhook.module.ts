import {Module} from "@nestjs/common";
import {WebhookService} from "./Webhook.service";

@Module({
    providers: [WebhookService],
    exports: [WebhookService],
})
export class WebhookModule {
}