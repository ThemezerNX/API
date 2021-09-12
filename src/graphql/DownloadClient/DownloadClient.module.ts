import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {DownloadClientEntity} from "./DownloadClient.entity";
import {DownloadClientService} from "./DownloadClient.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([DownloadClientEntity]),
    ],
    providers: [DownloadClientService],
    exports: [DownloadClientService],
})
export class DownloadClientModule {
}