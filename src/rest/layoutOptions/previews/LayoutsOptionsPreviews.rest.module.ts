import {Module} from "@nestjs/common";
import {LayoutsOptionsPreviewsRestController} from "./LayoutsOptionsPreviews.rest.controller";
import {LayoutOptionModule} from "../../../graphql/LayoutOption/LayoutOption.module";

@Module({
    imports: [
        LayoutOptionModule,
    ],
    controllers: [LayoutsOptionsPreviewsRestController],
})
export class LayoutsOptionsPreviewsRestModule {
}
