import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {NXInstallerResolver} from "./NXInstaller.resolver";
import {PackEntity} from "../Pack/Pack.entity";
import {PackService} from "../Pack/Pack.service";
import {ThemeModule} from "../Theme/Theme.module";
import {HBThemeModule} from "../HBTheme/HBTheme.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([PackEntity]),
        ThemeModule,
        HBThemeModule,
    ],
    providers: [NXInstallerResolver, PackService],
})
export class NXInstallerModule {
}