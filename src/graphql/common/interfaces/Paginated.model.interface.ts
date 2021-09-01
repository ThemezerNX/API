import {Field, Int, InterfaceType, ObjectType} from "@nestjs/graphql";
import {PaginationArgs} from "../args/Pagination.args";


@ObjectType()
class PageInfo {

    constructor(page: number, limit: number, totalCount: number) {
        this.page = page;
        this.limit = limit;
        this.pageCount = Math.ceil(totalCount / limit);
        this.itemCount = totalCount;
    }

    @Field(() => Int)
    readonly page: number;

    @Field(() => Int)
    limit: number;

    @Field(() => Int)
    pageCount: number;

    @Field(() => Int)
    itemCount: number;

}

export interface PaginatedNodesInterface<Model> {
    nodes: Model[]
}

@InterfaceType("PaginatedInterface")
export abstract class Pagination<Model> implements PaginatedNodesInterface<Model> {

    constructor({page, limit}: PaginationArgs, totalCount: number, nodes: Model[]) {
        this.pageInfo = new PageInfo(page, limit, totalCount);
        this.nodes = nodes;
    }

    nodes: Model[];

    @Field(() => PageInfo)
    pageInfo: PageInfo;

}
