import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserResolver} from "./User.resolver";
import {UserEntity} from "./User.entity";
import {UserService} from "./User.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
    ],
    providers: [UserResolver, UserService],
})
export class UserModule {
}