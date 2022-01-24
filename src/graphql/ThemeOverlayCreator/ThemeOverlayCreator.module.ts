import {Module} from "@nestjs/common";
import {ThemeOverlayCreatorResolver} from "./ThemeOverlayCreator.resolver";
import {ThemeOverlayCreatorService} from "./ThemeOverlayCreator.service";
import {LayoutModule} from "../Layout/Layout.module";

@Module({
    imports: [
        LayoutModule,
    ],
    providers: [ThemeOverlayCreatorResolver, ThemeOverlayCreatorService],
    exports: [ThemeOverlayCreatorService],
})
export class ThemeOverlayCreatorModule {
}