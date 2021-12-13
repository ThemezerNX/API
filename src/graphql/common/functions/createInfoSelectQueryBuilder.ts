import {Repository, SelectQueryBuilder} from "typeorm";
import {ServiceFindOptionsParameter} from "../interfaces/ServiceFindOptions.parameter";
import {PerchQueryBuilder} from "perch-query-builder";
import {joinAndSelectRelations} from "./serviceFunctions";

export function createInfoSelectQueryBuilder<E>(options: ServiceFindOptionsParameter<E>, repository: Repository<E>): SelectQueryBuilder<E> {
    let queryBuilder;
    if (options?.info) {
        queryBuilder = PerchQueryBuilder.generateQueryBuilder(
            repository,
            options.info,
            {rootField: options.rootField},
        );
    } else {
        queryBuilder = repository.createQueryBuilder();
        joinAndSelectRelations(queryBuilder, options);
    }
    return queryBuilder;
}