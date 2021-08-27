import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ThemeResolver} from "./Theme.resolver";
import {ThemeEntity} from "./Theme.entity";
import {ThemeService} from "./Theme.service";
import {UserService} from "../User/User.service";
import {UserEntity} from "../User/User.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([ThemeEntity]),
        TypeOrmModule.forFeature([UserEntity]),
    ],
    providers: [ThemeResolver, ThemeService, UserService],
})
export class ThemeModule {
}