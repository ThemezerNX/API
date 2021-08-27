import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserService} from "../User/User.service";
import {UserEntity} from "../User/User.entity";
import {UserResolver} from "../User/User.resolver";
import {LayoutService} from "./Layout.service";
import {LayoutResolver} from "./Layout.resolver";
import {LayoutEntity} from "./Layout.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([LayoutEntity]),
        TypeOrmModule.forFeature([UserEntity]),
    ],
    providers: [LayoutResolver, LayoutService, UserService, UserResolver],
})
export class LayoutModule {
}