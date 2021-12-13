import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PackService} from "./Pack.service";
import {PackResolver} from "./Pack.resolver";
import {PackEntity} from "./Pack.entity";
import {UserModule} from "../User/User.module";
import {PackDownloadModule} from "./Download/PackDownload.module";
import {PackHashEntity} from "../Cache/Pack/PackHash.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([PackEntity]),
        TypeOrmModule.forFeature([PackHashEntity]),
        UserModule,
        PackDownloadModule,
    ],
    providers: [PackResolver, PackService],
    exports: [PackService, PackDownloadModule],
})
export class PackModule {
}