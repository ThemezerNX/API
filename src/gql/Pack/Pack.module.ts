import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../User/User.entity";
import {PackService} from "./Pack.service";
import {PackResolver} from "./Pack.resolver";
import {PackEntity} from "./Pack.entity";
import {ThemeService} from "../Theme/Theme.service";
import {UserService} from "../User/User.service";
import {ThemeEntity} from "../Theme/Theme.entity";
import {HBThemeService} from "../HBTheme/HBTheme.service";
import {HBThemeEntity} from "../HBTheme/HBTheme.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([PackEntity]),
        TypeOrmModule.forFeature([UserEntity]),
        TypeOrmModule.forFeature([ThemeEntity]),
        TypeOrmModule.forFeature([HBThemeEntity]),
    ],
    providers: [PackResolver, PackService, UserService, ThemeService, HBThemeService],
})
export class PackModule {
}