import {ExecutionContext, Injectable} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {GqlExecutionContext} from "@nestjs/graphql";
import {AlreadyAuthenticatedError} from "../../../../common/errors/auth/AlreadyAuthenticated.error";

@Injectable()
export class LocalLoginGuard extends AuthGuard("local") {

    getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        const req = ctx.getContext().req;

        if (req.isAuthenticated()) {
            throw new AlreadyAuthenticatedError();
        }

        const {loginData} = ctx.getArgs();
        // use graphql parameters as request body
        // because passport-local tries to read req.body for email and password
        req.body = loginData;
        return req;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const result = await super.canActivate(context);

        if (result) {
            const ctx = GqlExecutionContext.create(context);
            const req = ctx.getContext().req;
            await super.logIn(req);
        }

        return true;
    }

}