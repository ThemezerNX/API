import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PackService} from "./Pack.service";
import {PackResolver} from "./Pack.resolver";
import {PackEntity} from "./Pack.entity";
import {UserModule} from "../User/User.module";
import {ThemeModule} from "../Theme/Theme.module";
import {HBThemeModule} from "../HBTheme/HBTheme.module";
import {PackDownloadModule} from "./Download/PackDownload.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([PackEntity]),
        HBThemeModule,
        ThemeModule,
        UserModule,
        PackDownloadModule,
    ],
    providers: [PackResolver, PackService],
    exports: [PackService, PackDownloadModule],
})
export class PackModule {
}