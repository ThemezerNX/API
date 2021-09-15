import {LayoutEntity} from "./Layout.entity";
import {FindConditions, In, Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {Target} from "../common/enums/Target";
import {InjectRepository} from "@nestjs/typeorm";
import {SortOrder} from "../common/enums/SortOrder";
import {executeAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSort} from "../common/args/ItemSortArgs";
import {toTsQuery} from "../common/TsQueryCreator";

@Injectable()
export class LayoutService {

    constructor(
        @InjectRepository(LayoutEntity) private repository: Repository<LayoutEntity>,
    ) {
    }

    findOne({id}: { id: string }, relations: string[] = []): Promise<LayoutEntity> {
        return this.repository.findOne({
            where: {id},
            relations,
        });
    }

    findAll(
        {
            paginationArgs,
            sort = ItemSort.ADDED,
            order = SortOrder.DESC,
            target,
            query,
            creators,
        }:
            {
                paginationArgs?: PaginationArgs,
                sort?: ItemSort,
                order?: SortOrder,
                query?: string,
                target?: Target,
                creators?: string[],
            },
    ): Promise<[LayoutEntity[], number]> {
        const findConditions: FindConditions<LayoutEntity> = {};

        if (target != undefined) {
            findConditions.target = target;
        }
        if (creators?.length > 0) {
            findConditions.creator = {
                id: In(creators),
            };
        }

        const queryBuilder = this.repository.createQueryBuilder("layout")
            .where(findConditions)
            .leftJoinAndSelect("layout.previews", "previews")
            .orderBy({["layout." + sort]: order});

        if (query?.length > 0) {
            queryBuilder.andWhere(`to_tsquery(:query) @@ (
                setweight(to_tsvector('pg_catalog.english', coalesce(layout.name, '')), 'A') ||
                setweight(to_tsvector('pg_catalog.english', coalesce(layout.description, '')), 'C')
            )`, {query: toTsQuery(query)});
        }

        return executeAndPaginate(paginationArgs, queryBuilder);
    }

    findRandom(
        {
            limit,
        }:
            {
                limit?: number,
            },
    ): Promise<LayoutEntity[]> {
        const query = this.repository.createQueryBuilder()
            .orderBy("RANDOM()");

        if (limit != undefined) {
            query.limit(limit);
        }

        return query.getMany();
    }

}