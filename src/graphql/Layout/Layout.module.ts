import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {LayoutService} from "./Layout.service";
import {LayoutResolver} from "./Layout.resolver";
import {LayoutEntity} from "./Layout.entity";
import {UserModule} from "../User/User.module";
import {LayoutDownloadModule} from "./Download/LayoutDownload.module";
import {LayoutOptionModule} from "../LayoutOption/LayoutOption.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([LayoutEntity]),
        UserModule,
        LayoutOptionModule,
        LayoutDownloadModule,
    ],
    providers: [LayoutResolver, LayoutService],
    exports: [LayoutService, LayoutDownloadModule],
})
export class LayoutModule {
}