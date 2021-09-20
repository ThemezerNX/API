import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ThemeResolver} from "./Theme.resolver";
import {ThemeEntity} from "./Theme.entity";
import {ThemeService} from "./Theme.service";
import {UserModule} from "../User/User.module";
import {ThemeDownloadModule} from "./Download/ThemeDownload.module";
import {ThemeOptionEntity} from "./ThemeOptions/ThemeOption.entity";
import {ThemeOptionService} from "./ThemeOptions/ThemeOption.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([ThemeEntity]),
        TypeOrmModule.forFeature([ThemeOptionEntity]),
        UserModule,
        ThemeDownloadModule,
    ],
    providers: [ThemeResolver, ThemeService, ThemeOptionService],
    exports: [ThemeService, ThemeDownloadModule],
})
export class ThemeModule {
}