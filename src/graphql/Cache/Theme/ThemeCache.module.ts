import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ThemeCacheService} from "./ThemeCache.service";
import {ThemeCacheEntity} from "./ThemeCache.entity";
import {ThemeModule} from "../../Theme/Theme.module";
import {LayoutModule} from "../../Layout/Layout.module";

@Module({
    imports: [
        ThemeModule,
        LayoutModule,
        TypeOrmModule.forFeature([ThemeCacheEntity]),
    ],
    providers: [ThemeCacheService],
    exports: [ThemeCacheService],
})
export class ThemeCacheModule {
}