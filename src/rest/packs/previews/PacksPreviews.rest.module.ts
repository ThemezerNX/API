import {Module} from "@nestjs/common";
import {PacksPreviewsRestController} from "./PacksPreviews.rest.controller";
import {PackModule} from "../../../graphql/Pack/Pack.module";

@Module({
    imports: [
        PackModule,
    ],
    controllers: [PacksPreviewsRestController],
})
export class PacksPreviewsRestModule {
}
