import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserModule} from "../User/User.module";
import {LayoutOptionEntity} from "./LayoutOption.entity";
import {LayoutOptionService} from "./LayoutOption.service";
import {LayoutOptionValueEntity} from "./OptionValue/LayoutOptionValue.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([LayoutOptionEntity]),
        TypeOrmModule.forFeature([LayoutOptionValueEntity]),
        UserModule,
    ],
    providers: [LayoutOptionService],
    exports: [LayoutOptionService],
})
export class LayoutOptionModule {
}