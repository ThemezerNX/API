import {Module} from "@nestjs/common";
import {ThemesAssetsController} from "./themesAssets.controller";
import {ThemeModule} from "../../../graphql/Theme/Theme.module";

@Module({
    imports: [
        ThemeModule,
    ],
    controllers: [ThemesAssetsController],
})
export class ThemesAssetsRestModule {
}
