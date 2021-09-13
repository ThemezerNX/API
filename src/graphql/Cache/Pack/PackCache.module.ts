import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PackCacheService} from "./PackCache.service";
import {PackModule} from "../../Pack/Pack.module";
import {PackCacheEntity} from "./PackCache.entity";
import {ThemeCacheModule} from "../Theme/ThemeCache.module";
import {HBThemeCacheModule} from "../HBTheme/HBThemeCache.module";

@Module({
    imports: [
        PackModule,
        ThemeCacheModule,
        HBThemeCacheModule,
        TypeOrmModule.forFeature([PackCacheEntity]),
    ],
    providers: [PackCacheService],
    exports: [PackCacheService],
})
export class PackCacheModule {
}