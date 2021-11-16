import {Injectable} from "@nestjs/common";
import {PassportSerializer} from "@nestjs/passport";
import {UserEntity} from "../User/User.entity";
import {UserService} from "../User/User.service";
import {UserNotFoundError} from "../common/errors/auth/UserNotFound.error";

@Injectable()
export class SessionSerializer extends PassportSerializer {

    constructor(private userService: UserService) {
        super();
    }

    serializeUser(user: UserEntity, done: CallableFunction) {
        done(null, user.id);
    }

    async deserializeUser(userId: string, done: CallableFunction) {
        const user = await this.userService.findOne({id: userId}, {
            relations: {
                profile: true,
                preferences: true,
                connections: true,
            },
        });
        if (!user) {
            done(new UserNotFoundError());
        }

        done(null, user);
    }

}
