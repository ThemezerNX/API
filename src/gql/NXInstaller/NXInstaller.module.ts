import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {NXInstallerResolver} from "./NXInstaller.resolver";
import {ThemeService} from "../Theme/Theme.service";
import {ThemeEntity} from "../Theme/Theme.entity";
import {PackEntity} from "../Pack/Pack.entity";
import {PackService} from "../Pack/Pack.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([PackEntity]),
        TypeOrmModule.forFeature([ThemeEntity]),
    ],
    providers: [NXInstallerResolver, PackService, ThemeService],
})
export class NXInstallerModule {
}