import {ArgsType, Field, Int} from "@nestjs/graphql";

@ArgsType()
export class PaginationArgs {

    @Field(() => Int)
    page: number = 1;

    @Field(() => Int)
    limit: number = 20;

}

export const paginationConditions = (paginationArgs: PaginationArgs | null | undefined) => {
    if (!!paginationArgs) {
        const {page, limit} = paginationArgs;

        return {
            skip: page - 1 >= 0 ? (page - 1) * limit : 0,
            take: limit > 0 ? limit : 20,
        };
    }

    return {};
};