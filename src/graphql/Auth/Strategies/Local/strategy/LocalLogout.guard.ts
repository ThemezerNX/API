import {ExecutionContext, Injectable} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {GqlExecutionContext} from "@nestjs/graphql";

@Injectable()
export class LocalLoginGuard extends AuthGuard("local") {

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