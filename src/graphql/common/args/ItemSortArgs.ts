import {ArgsType, Field, registerEnumType} from "@nestjs/graphql";
import {SortInterface} from "../interfaces/Sort.interface";

export enum ItemSort {
    DOWNLOADS = "dlCount",
    // LIKES = "likes",
    UPDATED = "updatedTimestamp",
    ADDED = "id",
}

registerEnumType(ItemSort, {
    name: "FilterSort",
});

@ArgsType()
export class ItemSortArgs extends SortInterface {

    @Field(() => ItemSort, {nullable: true})
    sort?: ItemSort = ItemSort.ADDED;

}