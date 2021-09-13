import {Module} from "@nestjs/common";
import {PacksDownloadRestController} from "./PacksDownload.rest.controller";
import {PackModule} from "../../../graphql/Pack/Pack.module";
import {PackCacheModule} from "../../../graphql/Cache/Pack/PackCache.module";

@Module({
    imports: [
        PackModule,
        PackCacheModule,
    ],
    controllers: [PacksDownloadRestController],
})
export class PacksDownloadRestModule {
}
