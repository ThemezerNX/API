import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserProfileEntity} from "./UserProfile.entity";
import {UserProfileResolver} from "./UserProfile.resolver";

@Module({
    imports: [TypeOrmModule.forFeature([UserProfileEntity])],
    // providers: [UserProfileResolver],
})
export class UserProfileModule {
}