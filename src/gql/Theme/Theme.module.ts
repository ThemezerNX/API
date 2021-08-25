import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ThemeResolver} from "./Theme.resolver";
import {ThemeEntity} from "./Theme.entity";
import {ThemePreviewsModule} from "./ThemePreviews/ThemePreviews.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ThemeEntity]),
        ThemePreviewsModule,
    ],
    providers: [ThemeResolver],
})
export class ThemeModule {
}