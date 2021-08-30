import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PackService} from "./Pack.service";
import {PackResolver} from "./Pack.resolver";
import {PackEntity} from "./Pack.entity";
import {UserModule} from "../User/User.module";
import {ThemeModule} from "../Theme/Theme.module";
import {HBThemeModule} from "../HBTheme/HBTheme.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([PackEntity]),
        HBThemeModule,
        ThemeModule,
        UserModule,
    ],
    providers: [PackResolver, PackService],
    exports: [PackService],
})
export class PackModule {
}