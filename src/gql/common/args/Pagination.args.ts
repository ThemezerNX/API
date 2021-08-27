import {ArgsType, Field, Int} from "@nestjs/graphql";

@ArgsType()
export class PaginationArgs {

    @Field(() => Int)
    page: number = 1;

    @Field(() => Int)
    limit: number = 20;

}

export const paginationConditions = (paginationArgs: PaginationArgs) => {
    if (paginationArgs) {
        const {page, limit} = paginationArgs;

        return {
            skip: (page - 1) * limit,
            take: limit,
        };
    }

    return {};
};