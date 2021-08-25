import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserProfileModule} from "./UserProfile/UserProfile.module";
import {UserResolver} from "./User.resolver";
import {UserEntity} from "./User.entity";
import {UserService} from "./User.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        UserProfileModule,
    ],
    providers: [UserResolver, UserService],
})
export class UserModule {
}