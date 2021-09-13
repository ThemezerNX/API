import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {HBThemeCacheService} from "./HBThemeCache.service";
import {HBThemeCacheEntity} from "./HBThemeCache.entity";
import {HBThemeModule} from "../../HBTheme/HBTheme.module";

@Module({
    imports: [
        HBThemeModule,
        TypeOrmModule.forFeature([HBThemeCacheEntity]),
    ],
    providers: [HBThemeCacheService],
    exports: [HBThemeCacheService],
})
export class HBThemeCacheModule {
}