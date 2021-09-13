import {Module} from "@nestjs/common";
import {ThemesDownloadRestController} from "./ThemesDownload.rest.controller";
import {ThemeModule} from "../../../graphql/Theme/Theme.module";
import {ThemeCacheModule} from "../../../graphql/Cache/Theme/ThemeCache.module";

@Module({
    imports: [
        ThemeModule,
        ThemeCacheModule
    ],
    controllers: [ThemesDownloadRestController],
})
export class ThemesDownloadRestModule {
}
