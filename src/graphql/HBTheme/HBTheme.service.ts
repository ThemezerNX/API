import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FindConditions, In, Repository} from "typeorm";
import {executeAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {SortOrder} from "../common/enums/SortOrder";
import {HBThemeEntity} from "./HBTheme.entity";
import {ItemSort} from "../common/args/ItemSortArgs";
import {toTsQuery} from "../common/TsQueryCreator";
import {PerchQueryBuilder} from "perch-query-builder";
import {ServiceFindOptionsParameter} from "../common/interfaces/ServiceFindOptions.parameter";
import {joinAndSelectRelations, selectPreviews} from "../common/functions/ServiceFunctions.js";
import {IsOwner} from "../common/interfaces/IsOwner.interface";
import {Exists} from "../common/findOperators/Exists";

@Injectable()
export class HBThemeService implements IsOwner {

    constructor(@InjectRepository(HBThemeEntity) private repository: Repository<HBThemeEntity>) {
    }

    findOne({
                id,
                isNSFW,
                packId,
            }:
                {
                    id?: string,
                    isNSFW?: boolean,
                    packId?: string
                },
            options?: ServiceFindOptionsParameter<HBThemeEntity>): Promise<HBThemeEntity> {
        let queryBuilder;
        if (options?.info) {
            queryBuilder = PerchQueryBuilder.generateQueryBuilder(this.repository, options.info);
        } else {
            queryBuilder = this.repository.createQueryBuilder();

            selectPreviews(queryBuilder, options);
            joinAndSelectRelations(queryBuilder, options); // always last
        }
        const findConditions: FindConditions<HBThemeEntity> = {};

        if (id != undefined) {
            findConditions.id = id;
        }
        if (isNSFW != undefined) {
            findConditions.isNSFW = isNSFW;
        }
        if (packId != undefined) {
            findConditions.packId = packId;
        }

        queryBuilder
            .leftJoinAndSelect(queryBuilder.alias + ".tags", "tags")
            .where(findConditions);

        return queryBuilder.getOne();
    }

    findAll(
        {
            packId,
            paginationArgs,
            sort = ItemSort.ADDED,
            order = SortOrder.DESC,
            query,
            creators,
            includeNSFW,
        }:
            {
                packId?: string,
                paginationArgs?: PaginationArgs,
                sort?: ItemSort,
                order?: SortOrder,
                query?: string,
                creators?: string[],
                includeNSFW?: boolean
            },
        options?: ServiceFindOptionsParameter<HBThemeEntity>,
    ): Promise<{ result: HBThemeEntity[], count: number }> {
        let queryBuilder;
        if (options?.info) {
            queryBuilder = PerchQueryBuilder.generateQueryBuilder(this.repository, options.info, {rootField: "nodes"});
        } else {
            queryBuilder = this.repository.createQueryBuilder();

            selectPreviews(queryBuilder, options);
            joinAndSelectRelations(queryBuilder, options); // always last
        }
        const findConditions: FindConditions<HBThemeEntity> = {};

        if (packId != undefined) {
            findConditions.packId = packId;
        }
        if (creators?.length > 0) {
            findConditions.creator = {
                id: In(creators),
            };
        }
        if (includeNSFW != true) {
            findConditions.isNSFW = false;
        }

        queryBuilder
            .where(findConditions)
            .leftJoinAndSelect(queryBuilder.alias + ".tags", "tags")
            .orderBy({[queryBuilder.alias + "." + sort]: order});

        if (query?.length > 0) {
            queryBuilder.andWhere(`to_tsquery(:query) @@ (
                setweight(to_tsvector('pg_catalog.english', coalesce(${queryBuilder.alias}.name, '')), 'A') ||
                setweight(to_tsvector('pg_catalog.english', coalesce(${queryBuilder.alias}.description, '')), 'C') ||
                to_tsvector('pg_catalog.english', coalesce(CASE WHEN ${queryBuilder.alias}."isNSFW" THEN 'NSFW' END, '')) ||
                to_tsvector(tags.name)
            )`, {query: toTsQuery(query)});
        }

        return executeAndPaginate(queryBuilder, paginationArgs);
    }

    findRandom(
        {
            limit,
            includeNSFW,
        }:
            {
                limit?: number,
                includeNSFW?: boolean
            },
    ): Promise<HBThemeEntity[]> {
        const findConditions: FindConditions<HBThemeEntity> = {};

        if (includeNSFW != true) {
            findConditions.isNSFW = false;
        }

        const queryBuilder = this.repository.createQueryBuilder("hbtheme")
            .where(findConditions)
            .leftJoinAndSelect("hbtheme.previews", "previews")
            .leftJoinAndSelect("hbtheme.assets", "assets")
            .leftJoinAndSelect("hbtheme.tags", "tags")
            .orderBy("RANDOM()");

        if (limit != undefined) {
            queryBuilder.limit(limit);
        }

        return queryBuilder.getMany();
    }

    async isOwner(hbthemeId: string, userId: string): Promise<boolean> {
        return !!(await Exists(
            this.repository.createQueryBuilder()
                .where({id: hbthemeId, creatorId: userId}),
        ));
    }

}