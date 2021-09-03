import {GqlExecutionContext} from "@nestjs/graphql";
import {createParamDecorator, ExecutionContext} from "@nestjs/common";

export const CurrentUser = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        const ctx = GqlExecutionContext.create(context);
        const req = ctx.getContext().req;
        return req.user;
    },
);