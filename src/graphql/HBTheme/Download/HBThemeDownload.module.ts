import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {HBThemeDownloadService} from "./HBThemeDownload.service";
import {HBThemeDownloadEntity} from "./HBThemeDownload.entity";
import {DownloadClientModule} from "../../DownloadClient/DownloadClient.module";

@Module({
    imports: [
        DownloadClientModule,
        TypeOrmModule.forFeature([HBThemeDownloadEntity]),
    ],
    providers: [HBThemeDownloadService],
    exports: [HBThemeDownloadService],
})
export class HBThemeDownloadModule {
}