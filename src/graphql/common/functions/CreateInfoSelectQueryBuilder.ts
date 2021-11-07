import {Repository, SelectQueryBuilder} from "typeorm";
import {ServiceFindOptionsParameter} from "../interfaces/ServiceFindOptions.parameter";
import {PreviewsEntityInterface} from "../interfaces/Previews.entity.interface";
import {AssetsEntityInterface} from "../interfaces/Assets.entity.interface";
import {PerchQueryBuilder} from "perch-query-builder";
import {joinAndSelectRelations, selectAssets, selectPreviews} from "./ServiceFunctions";

export function createInfoSelectQueryBuilder<E, PE extends PreviewsEntityInterface, AE extends AssetsEntityInterface>
(options: ServiceFindOptionsParameter<E, PE, AE>, repository: Repository<E>, {
    hasPreviews = false,
    hasAssets = false,
}): SelectQueryBuilder<E> {
    let queryBuilder;
    if (options?.info) {
        queryBuilder = PerchQueryBuilder.generateQueryBuilder(
            repository,
            options.info,
            {rootField: options.rootField},
        );
    } else {
        queryBuilder = repository.createQueryBuilder();

        if (hasPreviews) {
            selectPreviews(queryBuilder, options);
        }
        if (hasAssets) {
            selectAssets(queryBuilder, options);
        }
        joinAndSelectRelations(queryBuilder, options); // always last
    }
    return queryBuilder;
}