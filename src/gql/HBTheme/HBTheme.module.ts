import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {HBThemeService} from "./HBTheme.service";
import {UserService} from "../User/User.service";
import {UserEntity} from "../User/User.entity";
import {HBThemeEntity} from "./HBTheme.entity";
import {HBThemeResolver} from "./HBTheme.resolver";

@Module({
    imports: [
        TypeOrmModule.forFeature([HBThemeEntity]),
        TypeOrmModule.forFeature([UserEntity]),
    ],
    providers: [HBThemeResolver, HBThemeService, UserService],
})
export class HBThemeModule {
}