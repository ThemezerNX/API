import {Module} from "@nestjs/common";
import {LayoutsDownloadRestController} from "./LayoutsDownload.rest.controller";
import {LayoutModule} from "../../../graphql/Layout/Layout.module";

@Module({
    imports: [
        LayoutModule,
    ],
    controllers: [LayoutsDownloadRestController],
})
export class LayoutsDownloadRestModule {
}
