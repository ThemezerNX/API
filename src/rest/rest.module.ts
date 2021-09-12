import {Module} from "@nestjs/common";
import {RestController} from "./rest.controller";
import {ResourcesRestModule} from "./resources/resources.rest.module";
import {RouterModule} from "@nestjs/core";
import {UsersRestModule} from "./users/users.rest.module";
import {ThemesPreviewsRestModule} from "./themes/assets/themesPreviews.rest.module";
import {ThemesAssetsRestModule} from "./themes/previews/themeAssets.rest.controller";
import {ThemesDownloadRestModule} from "./themes/download/themesDownload.rest.module";

@Module({
    imports: [
        ResourcesRestModule,
        UsersRestModule,
        ThemesPreviewsRestModule,
        ThemesAssetsRestModule,
        ThemesDownloadRestModule,
        RouterModule.register([
            {
                path: "cdn",
                children: [
                    {
                        path: "users",
                        module: UsersRestModule,
                    },
                    {
                        path: "themes/:id",
                        children: [
                            {
                                path: "previews",
                                module: ThemesPreviewsRestModule,
                            },
                            {
                                path: "assets",
                                module: ThemesAssetsRestModule,
                            },
                            {
                                path: "download",
                                module: ThemesDownloadRestModule,
                            },
                        ],
                    },
                ],
            },
        ]),
    ],
    controllers: [RestController],
})
export class RestModule {
}
