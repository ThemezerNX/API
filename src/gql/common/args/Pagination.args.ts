import {ArgsType, Field, Int} from "@nestjs/graphql";
import {SelectQueryBuilder} from "typeorm";
import {Min} from "class-validator";

@ArgsType()
export class LimitArg {

    @Field(() => Int, {description: "The maximum amount of items to return"})
    @Min(1)
    limit: number = 20;

}

@ArgsType()
export class PaginationArgs extends LimitArg {

    @Field(() => Int, {description: "Which page of items to return. Calculated using the limit argument."})
    @Min(1)
    page: number = 1;

}

const skip = (page, limit) => {
    return page - 1 >= 0 ? (page - 1) * limit : 0;
};

const take = (limit) => {
    return limit > 0 ? limit : 20;
};


export const paginationConditions = (paginationArgs: PaginationArgs | null | undefined) => {
    if (!!paginationArgs) {
        const {page, limit} = paginationArgs;

        return {
            skip: skip(page, limit),
            take: take(limit),
        };
    }

    return {};
};

export const queryPaginator = (paginationArgs: PaginationArgs | null | undefined, queryBuilder: SelectQueryBuilder<any>) => {
    if (!!paginationArgs && !!queryBuilder) {
        const {page, limit} = paginationArgs;

        return queryBuilder
            .skip(skip(page, limit))
            .limit(take(limit));
    }

    return null;
};