import {registerEnumType} from "type-graphql";

export enum FilterSort {
    DOWNLOADS = "downloads",
    // LIKES = "likes",
    UPDATED = "updated",
    ADDED = "added",
}

registerEnumType(FilterSort, {
    name: "FilterSort",
});

export enum FilterOrder {
    ASC = "asc",
    DESC = "desc",
}

registerEnumType(FilterOrder, {
    name: "FilterOrder",
});