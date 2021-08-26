import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ThemeResolver} from "./Theme.resolver";
import {ThemeEntity} from "./Theme.entity";
import {ThemeService} from "./Theme.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([ThemeEntity]),
    ],
    providers: [ThemeService, ThemeResolver],
})
export class ThemeModule {
}