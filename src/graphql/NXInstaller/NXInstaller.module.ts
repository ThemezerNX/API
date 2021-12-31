import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {NXInstallerResolver} from "./NXInstaller.resolver";
import {PackEntity} from "../Pack/Pack.entity";
import {PackService} from "../Pack/Pack.service";
import {ThemeModule} from "../Theme/Theme.module";
import {HBThemeModule} from "../HBTheme/HBTheme.module";
import {PackHashEntity} from "../Cache/Pack/PackHash.entity";
import {MailModule} from "../../mail/mail.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([PackEntity]),
        TypeOrmModule.forFeature([PackHashEntity]),
        ThemeModule,
        HBThemeModule,
        MailModule,
    ],
    providers: [NXInstallerResolver, PackService],
})
export class NXInstallerModule {
}