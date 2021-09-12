import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ThemeDownloadService} from "./ThemeDownload.service";
import {ThemeDownloadEntity} from "./ThemeDownload.entity";
import {DownloadClientModule} from "../../DownloadClient/DownloadClient.module";

@Module({
    imports: [
        DownloadClientModule,
        TypeOrmModule.forFeature([ThemeDownloadEntity]),
    ],
    providers: [ThemeDownloadService],
    exports: [ThemeDownloadService],
})
export class ThemeDownloadModule {
}