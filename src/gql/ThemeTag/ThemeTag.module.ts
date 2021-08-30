import {Module} from "@nestjs/common";
import {ThemeTagResolver} from "./ThemeTag.resolver";
import {ThemeTagService} from "./ThemeTag.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ThemeTagEntity} from "./ThemeTag.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([ThemeTagEntity]),
    ],
    providers: [ThemeTagResolver, ThemeTagService],
    exports: [ThemeTagService],

})
export class ThemeTagModule {
}