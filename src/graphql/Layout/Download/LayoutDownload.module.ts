import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {LayoutDownloadService} from "./LayoutDownload.service";
import {DownloadClientModule} from "../../DownloadClient/DownloadClient.module";
import {LayoutDownloadEntity} from "./LayoutDownload.entity";

@Module({
    imports: [
        DownloadClientModule,
        TypeOrmModule.forFeature([LayoutDownloadEntity]),
    ],
    providers: [LayoutDownloadService],
    exports: [LayoutDownloadService],
})
export class LayoutDownloadModule {
}