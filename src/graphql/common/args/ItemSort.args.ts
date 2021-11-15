import {ArgsType, Field, registerEnumType} from "@nestjs/graphql";
import {SortInterface} from "../interfaces/Sort.interface";
import {IsOptional} from "class-validator";

@ArgsType()
export class ItemSortArgs extends SortInterface {

    @Field(() => ItemSort, {nullable: true})
    @IsOptional()
    sort?: ItemSort = ItemSort.ADDED;

}

export enum ItemSort {
    DOWNLOADS = "downloadCount",
    // LIKES = "likes",
    UPDATED = "updatedTimestamp",
    ADDED = "id",
}

registerEnumType(ItemSort, {
    name: "FilterSort",
});
