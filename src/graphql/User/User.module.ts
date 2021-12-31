import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserResolver} from "./User.resolver";
import {UserEntity} from "./User.entity";
import {UserService} from "./User.service";
import {LayoutModule} from "../Layout/Layout.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        LayoutModule,
    ],
    providers: [UserResolver, UserService],
    exports: [UserService],
})
export class UserModule {
}