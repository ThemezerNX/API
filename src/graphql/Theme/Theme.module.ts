import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ThemeResolver} from "./Theme.resolver";
import {ThemeEntity} from "./Theme.entity";
import {ThemeService} from "./Theme.service";
import {UserModule} from "../User/User.module";
import {ThemeDownloadModule} from "./Download/ThemeDownload.module";
import {ThemeOptionEntity} from "./ThemeOptions/ThemeOption.entity";
import {ThemeOptionService} from "./ThemeOptions/ThemeOption.service";
import {LayoutOptionModule} from "../LayoutOption/LayoutOption.module";
import {ThemeHashEntity} from "../Cache/Theme/ThemeHash.entity";
import {WebhookModule} from "../../webhook/Webhook.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ThemeEntity]),
        TypeOrmModule.forFeature([ThemeHashEntity]),
        TypeOrmModule.forFeature([ThemeOptionEntity]),
        TypeOrmModule.forFeature([ThemeOptionEntity]),
        UserModule,
        ThemeDownloadModule,
        LayoutOptionModule,
        WebhookModule,
    ],
    providers: [ThemeResolver, ThemeService, ThemeOptionService],
    exports: [ThemeService, ThemeDownloadModule],
})
export class ThemeModule {
}