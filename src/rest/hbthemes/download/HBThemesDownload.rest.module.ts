import {Module} from "@nestjs/common";
import {HBThemesDownloadRestController} from "./HBThemesDownload.rest.controller";
import {HBThemeModule} from "../../../graphql/HBTheme/HBTheme.module";
import {HBThemeCacheModule} from "../../../graphql/Cache/HBTheme/HBThemeCache.module";

@Module({
    imports: [
        HBThemeModule,
        HBThemeCacheModule
    ],
    controllers: [HBThemesDownloadRestController],
})
export class HBThemesDownloadRestModule {
}
