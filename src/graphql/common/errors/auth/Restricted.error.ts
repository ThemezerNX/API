import {UnauthorizedError} from "./Unauthorized.error";

export class RestrictedError extends UnauthorizedError {

    langKey = "RESTRICTED";

}