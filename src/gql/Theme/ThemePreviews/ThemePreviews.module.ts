import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ThemePreviewsEntity} from "./ThemePreviews.entity";
import {ThemePreviewsResolver} from "./ThemePreviews.resolver";

@Module({
    imports: [TypeOrmModule.forFeature([ThemePreviewsEntity])],
    providers: [ThemePreviewsResolver],
})
export class ThemePreviewsModule {
}