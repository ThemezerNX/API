import {Module} from "@nestjs/common";
import {RestController} from "./rest.controller";
import {ResourcesRestModule} from "./resources/resources.rest.module";
import {RouterModule} from "@nestjs/core";
import {UsersRestModule} from "./users/users.rest.module";
import {ThemesPreviewsRestModule} from "./themes/previews/ThemesPreviews.rest.module";
import {ThemesAssetsRestModule} from "./themes/assets/ThemesAssets.rest.module";
import {ThemesDownloadRestModule} from "./themes/download/ThemesDownload.rest.module";
import {HBThemesPreviewsRestModule} from "./hbthemes/previews/HBThemesPreviews.rest.module";
import {HBThemesAssetsRestModule} from "./hbthemes/assets/HBThemesAssets.rest.module";
import {HBThemesDownloadRestModule} from "./hbthemes/download/HBThemesDownload.rest.module";
import {PacksDownloadRestModule} from "./packs/download/PacksDownload.rest.module";
import {PacksPreviewsRestModule} from "./packs/previews/PacksPreviews.rest.module";
import {LayoutsDownloadRestModule} from "./layouts/download/LayoutsDownload.rest.module";
import {LayoutsPreviewsRestModule} from "./layouts/previews/LayoutsPreviews.rest.module";
import {LayoutsOptionsPreviewsRestModule} from "./layouts/options/previews/LayoutsOptionsPreviews.rest.module";

@Module({
    imports: [
        ResourcesRestModule,
        UsersRestModule,
        ThemesPreviewsRestModule,
        ThemesAssetsRestModule,
        ThemesDownloadRestModule,
        HBThemesPreviewsRestModule,
        HBThemesAssetsRestModule,
        HBThemesDownloadRestModule,
        PacksDownloadRestModule,
        PacksPreviewsRestModule,
        LayoutsDownloadRestModule,
        LayoutsPreviewsRestModule,
        LayoutsOptionsPreviewsRestModule,
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
                    {
                        path: "hbthemes/:id",
                        children: [
                            {
                                path: "previews",
                                module: HBThemesPreviewsRestModule,
                            },
                            {
                                path: "assets",
                                module: HBThemesAssetsRestModule,
                            },
                            {
                                path: "download",
                                module: HBThemesDownloadRestModule,
                            },
                        ],
                    },
                    {
                        path: "packs/:id",
                        children: [
                            {
                                path: "previews",
                                module: PacksPreviewsRestModule,
                            },
                            {
                                path: "download",
                                module: PacksDownloadRestModule,
                            },
                        ],
                    },
                    {
                        path: "layouts/:id",
                        children: [
                            {
                                path: "previews",
                                module: LayoutsPreviewsRestModule,
                            },
                            {
                                path: "download",
                                module: LayoutsDownloadRestModule,
                            },
                            {
                                path: "options/:id",
                                children: [
                                    {
                                        path: "previews",
                                        module: LayoutsOptionsPreviewsRestModule,
                                    },
                                ],
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
