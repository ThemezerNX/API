import {Module} from "@nestjs/common";
import {HBThemeModule} from "../../../../graphql/HBTheme/HBTheme.module";
import {LayoutsOptionsPreviewsRestController} from "./LayoutsOptionsPreviews.rest.controller";

@Module({
    imports: [
        HBThemeModule,
    ],
    controllers: [LayoutsOptionsPreviewsRestController],
})
export class LayoutsOptionsPreviewsRestModule {
}
