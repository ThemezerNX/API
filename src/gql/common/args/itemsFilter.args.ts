import {ArgsType, Field} from "@nestjs/graphql";
import {Target} from "../enums/Target";
import {FilterOrder, FilterSort} from "../enums/SortOrder";
import {PaginationArgs} from "./pagination.args";

@ArgsType()
export class itemsFilterArgs extends PaginationArgs {

    @Field(() => Target, {nullable: true})
    target?: Target;

    @Field({nullable: true})
    query?: string;

    @Field(() => FilterSort, {nullable: true})
    sort?: FilterSort;

    @Field(() => FilterOrder, {nullable: true})
    order?: FilterOrder;

    @Field(() => [String], {nullable: true})
    creators?: string[];

    @Field(() => [String], {nullable: true})
    layouts?: string[];

    @Field({nullable: true})
    nsfw?: boolean;

}