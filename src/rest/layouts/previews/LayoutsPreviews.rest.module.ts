import {Module} from "@nestjs/common";
import {LayoutsPreviewsRestController} from "./LayoutsPreviews.rest.controller";
import {LayoutModule} from "../../../graphql/Layout/Layout.module";

@Module({
    imports: [
        LayoutModule,
    ],
    controllers: [LayoutsPreviewsRestController],
})
export class LayoutsPreviewsRestModule {
}
