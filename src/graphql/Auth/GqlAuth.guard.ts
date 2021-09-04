import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";
import {UnauthenticatedError} from "../common/errors/auth/Unauthenticated.error";

@Injectable()
export class GqlAuthGuard implements CanActivate {

    canActivate(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        const req = ctx.getContext().req;

        if (req.isAuthenticated()) {
            return true;
        } else throw new UnauthenticatedError();
    }

}