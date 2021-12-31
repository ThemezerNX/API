import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {LayoutService} from "./Layout.service";
import {LayoutResolver} from "./Layout.resolver";
import {LayoutEntity} from "./Layout.entity";
import {LayoutDownloadModule} from "./Download/LayoutDownload.module";
import {LayoutOptionModule} from "../LayoutOption/LayoutOption.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([LayoutEntity]),
        LayoutOptionModule,
        LayoutDownloadModule,
    ],
    providers: [LayoutService, LayoutResolver],
    exports: [LayoutService, LayoutDownloadModule],
})
export class LayoutModule {
}