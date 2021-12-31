import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {HBThemeService} from "./HBTheme.service";
import {HBThemeEntity} from "./HBTheme.entity";
import {HBThemeResolver} from "./HBTheme.resolver";
import {UserModule} from "../User/User.module";
import {HBThemeDownloadModule} from "./Download/HBThemeDownload.module";
import {HBThemeHashEntity} from "../Cache/HBTheme/HBThemeHash.entity";
import {MailModule} from "../../mail/mail.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([HBThemeEntity]),
        TypeOrmModule.forFeature([HBThemeHashEntity]),
        UserModule,
        HBThemeDownloadModule,
        MailModule,
    ],
    providers: [HBThemeResolver, HBThemeService],
    exports: [HBThemeService, HBThemeDownloadModule],
})
export class HBThemeModule {
}