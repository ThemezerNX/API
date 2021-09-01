import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {HBThemeService} from "./HBTheme.service";
import {HBThemeEntity} from "./HBTheme.entity";
import {HBThemeResolver} from "./HBTheme.resolver";
import {UserModule} from "../User/User.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([HBThemeEntity]),
        UserModule,
    ],
    providers: [HBThemeResolver, HBThemeService],
    exports: [HBThemeService],
})
export class HBThemeModule {
}