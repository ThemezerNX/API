import {PassportStrategy} from "@nestjs/passport";
import {AuthService} from "../../../Auth.service";
import {Injectable} from "@nestjs/common";
import {Strategy} from "passport-local";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {

    constructor(private authService: AuthService) {
        super({usernameField: "email"});
    }

    async validate(email: string, password: string, done: CallableFunction) {
        const user = await this.authService.validateUser(email, password);
        done(null, user);
    }

}