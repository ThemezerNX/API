import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ThemeResolver} from "./Theme.resolver";
import {ThemeEntity} from "./Theme.entity";
import {ThemeService} from "./Theme.service";
import {UserModule} from "../User/User.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ThemeEntity]),
        UserModule,
    ],
    providers: [ThemeResolver, ThemeService],
    exports: [ThemeService],
})
export class ThemeModule {
}