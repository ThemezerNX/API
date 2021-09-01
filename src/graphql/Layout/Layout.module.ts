import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {LayoutService} from "./Layout.service";
import {LayoutResolver} from "./Layout.resolver";
import {LayoutEntity} from "./Layout.entity";
import {UserModule} from "../User/User.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([LayoutEntity]),
        UserModule,
    ],
    providers: [LayoutResolver, LayoutService],
    exports: [LayoutService],
})
export class LayoutModule {
}