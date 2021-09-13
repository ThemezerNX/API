import {Module} from "@nestjs/common";
import {ThemesAssetsRestController} from "./ThemesAssets.rest.controller";
import {ThemeModule} from "../../../graphql/Theme/Theme.module";

@Module({
    imports: [
        ThemeModule,
    ],
    controllers: [ThemesAssetsRestController],
})
export class ThemesAssetsRestModule {
}
