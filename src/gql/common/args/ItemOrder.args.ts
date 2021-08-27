import {ArgsType, Field} from "@nestjs/graphql";
import {FilterOrder, FilterSort} from "../enums/SortOrder";

@ArgsType()
export class ItemOrderArgs {

    @Field(() => FilterSort)
    sort: FilterSort = FilterSort.ADDED;

    @Field(() => FilterOrder)
    order: FilterOrder = FilterOrder.DESC;

}