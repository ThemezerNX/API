import {Controller} from "@nestjs/common";
import {AuthService} from "./Auth.service";

@Controller()
export class AuthController {

    constructor(private _authService: AuthService) {
    }

    // rest endpoints here for future oauth callbacks

}