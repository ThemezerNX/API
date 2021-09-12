import {Module} from "@nestjs/common";
import {ThemesPreviewsController} from "./themesPreviews.controller";
import {ThemeModule} from "../../../graphql/Theme/Theme.module";

@Module({
    imports: [
        ThemeModule,
    ],
    controllers: [ThemesPreviewsController],
})
export class ThemesPreviewsRestModule {
}
