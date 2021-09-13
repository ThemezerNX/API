import {Module} from "@nestjs/common";
import {HBThemeModule} from "../../../graphql/HBTheme/HBTheme.module";
import {HBThemesAssetsRestController} from "./HBThemesAssets.rest.controller";

@Module({
    imports: [
        HBThemeModule,
    ],
    controllers: [HBThemesAssetsRestController],
})
export class HBThemesAssetsRestModule {
}
