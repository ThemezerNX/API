import {Repository, SelectQueryBuilder} from "typeorm";
import {ServiceFindOptionsParameter} from "../interfaces/ServiceFindOptions.parameter";
import {PerchQueryBuilder} from "perch-query-builder";
import {joinAndSelectRelations} from "./serviceFunctions";

export function createInfoSelectQueryBuilder<E>(options: ServiceFindOptionsParameter<E>, repository: Repository<E>, queryBuilder?: SelectQueryBuilder<E>): SelectQueryBuilder<E> {
    let qb;
    if (options?.info) {
        qb = PerchQueryBuilder.generateQueryBuilder(
            repository,
            options.info,
            {rootField: options.rootField, qb: queryBuilder}
        );
    } else {
        qb = repository.createQueryBuilder();
        joinAndSelectRelations(qb, options);
    }
    return qb;
}