import {registerEnumType} from "@nestjs/graphql";

export enum FilterSort {
    DOWNLOADS = "dlCount",
    // LIKES = "likes",
    UPDATED = "updatedTimestamp",
    ADDED = "addedTimestamp",
}

registerEnumType(FilterSort, {
    name: "FilterSort",
});

export enum FilterOrder {
    ASC = "ASC",
    DESC = "DESC",
}

registerEnumType(FilterOrder, {
    name: "FilterOrder",
});