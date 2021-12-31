import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {LayoutOptionEntity} from "./LayoutOption.entity";
import {LayoutOptionService} from "./LayoutOption.service";
import {LayoutOptionValueEntity} from "./OptionValue/LayoutOptionValue.entity";
import {LayoutOptionResolver} from "./LayoutOption.resolver";

@Module({
    imports: [
        TypeOrmModule.forFeature([LayoutOptionEntity]),
        TypeOrmModule.forFeature([LayoutOptionValueEntity]),
    ],
    providers: [LayoutOptionService, LayoutOptionResolver],
    exports: [LayoutOptionService],
})
export class LayoutOptionModule {
}