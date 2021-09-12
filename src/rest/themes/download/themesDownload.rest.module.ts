import {Module} from "@nestjs/common";
import {ThemesDownloadController} from "./themesDownload.controller";
import {ThemeModule} from "../../../graphql/Theme/Theme.module";
import {ThemeCacheModule} from "../../../graphql/Cache/Theme/ThemeCache.module";

@Module({
    imports: [
        ThemeModule,
        ThemeCacheModule,
    ],
    controllers: [ThemesDownloadController],
})
export class ThemesDownloadRestModule {
}
