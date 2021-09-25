import {createParamDecorator} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";

export const UserAgent = createParamDecorator(
    (data: unknown, context: any) => {
        let req;
        if (context.contextType == "graphql") {
            const ctx = GqlExecutionContext.create(context);
            req = ctx.getContext().req;
        } else {
            req = context.switchToHttp().getRequest();
        }
        return req.header("User-Agent");
    },
);