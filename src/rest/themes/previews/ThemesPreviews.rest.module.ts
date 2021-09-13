import {Module} from "@nestjs/common";
import {ThemesPreviewsRestController} from "./ThemesPreviews.rest.controller";
import {ThemeModule} from "../../../graphql/Theme/Theme.module";

@Module({
    imports: [
        ThemeModule,
    ],
    controllers: [ThemesPreviewsRestController],
})
export class ThemesPreviewsRestModule {
}
