import {ArgsType, Field, Int} from "@nestjs/graphql";
import {SelectQueryBuilder} from "typeorm";
import {Min} from "class-validator";

@ArgsType()
export class LimitArg {

    constructor(limit: number) {
        this.limit = limit;
    }

    @Field(() => Int, {defaultValue: 20, description: "The maximum amount of items to return"})
    @Min(1)
    limit: number = 20;

}

@ArgsType()
export class PaginationArgs extends LimitArg {

    constructor(limit?: number, page?: number) {
        super(limit);
        this.page = page;
    }

    @Field(() => Int, {defaultValue: 1, description: "Which page of items to return"})
    @Min(1)
    page: number = 1;

}

const skip = (page: number, limit: number) => {
    return page - 1 >= 0 ? (page - 1) * limit : 0;
};

const take = (limit: number) => {
    return limit > 0 ? limit : 20;
};

export const paginationConditions = (paginationArgs: PaginationArgs) => {
    if (!!paginationArgs) {
        const {page, limit} = paginationArgs;

        return {
            skip: skip(page, limit),
            take: take(limit),
        };
    }

    return {};
};

export const executeAndPaginate = async <Entity>(paginationArgs: PaginationArgs, queryBuilder: SelectQueryBuilder<Entity>): Promise<{result: Entity[], count: number}> => {
    if (!!paginationArgs && !!queryBuilder) {
        const {page, limit} = paginationArgs;

        queryBuilder
            .skip(skip(page, limit))
            .limit(take(limit));

        return {result: await queryBuilder.getMany(), count: await queryBuilder.getCount()};
    }

    return {result: await queryBuilder.getMany(), count: await queryBuilder.getCount()};
};