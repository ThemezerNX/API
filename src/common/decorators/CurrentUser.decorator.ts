import {GqlExecutionContext} from "@nestjs/graphql";
import {createParamDecorator} from "@nestjs/common";

export const CurrentUser = createParamDecorator(
    (data: unknown, context: any) => {
        let req;
        if (context.contextType == "graphql") {
            const ctx = GqlExecutionContext.create(context);
            req = ctx.getContext().req;
        } else {
            req = context.switchToHttp().getRequest();
        }
        return req.user;
    },
);