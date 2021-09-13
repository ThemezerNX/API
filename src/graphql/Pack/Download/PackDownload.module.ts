import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PackDownloadService} from "./PackDownload.service";
import {PackDownloadEntity} from "./PackDownload.entity";
import {DownloadClientModule} from "../../DownloadClient/DownloadClient.module";

@Module({
    imports: [
        DownloadClientModule,
        TypeOrmModule.forFeature([PackDownloadEntity]),
    ],
    providers: [PackDownloadService],
    exports: [PackDownloadService],
})
export class PackDownloadModule {
}