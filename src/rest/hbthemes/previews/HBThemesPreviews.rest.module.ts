import {Module} from "@nestjs/common";
import {HBThemesPreviewsRestController} from "./HBThemesPreviews.rest.controller";
import {HBThemeModule} from "../../../graphql/HBTheme/HBTheme.module";

@Module({
    imports: [
        HBThemeModule,
    ],
    controllers: [HBThemesPreviewsRestController],
})
export class HBThemesPreviewsRestModule {
}
