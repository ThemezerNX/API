import {Module} from "@nestjs/common";
import {UsersController} from "./users.controller";
import {UserModule} from "../../graphql/User/User.module";

@Module({
    imports: [
        UserModule
    ],
    controllers: [UsersController],
})
export class UsersRestModule {
}
