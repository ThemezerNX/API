import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ThemeResolver} from "./Theme.resolver";
import {ThemeEntity} from "./Theme.entity";
import {ThemeService} from "./Theme.service";
import {UserModule} from "../User/User.module";
import {ThemeDownloadModule} from "./Download/ThemeDownload.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ThemeEntity]),
        UserModule,
        ThemeDownloadModule,
    ],
    providers: [ThemeResolver, ThemeService],
    exports: [ThemeService, ThemeDownloadModule],
})
export class ThemeModule {
}