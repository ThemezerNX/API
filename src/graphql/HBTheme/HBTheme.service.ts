import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FindConditions, In, Repository} from "typeorm";
import {executeAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {SortOrder} from "../common/enums/SortOrder";
import {HBThemeEntity} from "./HBTheme.entity";
import {ItemSort} from "../common/args/ItemSort.args";
import {toTsQuery} from "../common/TsQueryCreator";
import {ServiceFindOptionsParameter} from "../common/interfaces/ServiceFindOptions.parameter";
import {IsOwner} from "../common/interfaces/IsOwner.interface";
import {exists} from "../common/functions/exists";
import {createInfoSelectQueryBuilder} from "../common/functions/createInfoSelectQueryBuilder";
import {HBThemeHashEntity} from "../Cache/HBTheme/HBThemeHash.entity";
import {GetHash} from "../common/interfaces/GetHash.interface";

@Injectable()
export class HBThemeService implements IsOwner, GetHash {

    constructor(
        @InjectRepository(HBThemeEntity) private repository: Repository<HBThemeEntity>,
        @InjectRepository(HBThemeHashEntity) private hashRepository: Repository<HBThemeHashEntity>,
    ) {
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
            options?: ServiceFindOptionsParameter<HBThemeEntity>,
    ): Promise<HBThemeEntity> {
        const queryBuilder = this.repository.createQueryBuilder()
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

        createInfoSelectQueryBuilder(options, this.repository);

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
        const queryBuilder = this.repository.createQueryBuilder();
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
            .orderBy({[`"${queryBuilder.alias}"."${sort}"`]: order})

        if (query?.length > 0) {
            // TODO: this only selects the tags that match the query. there is a double join caused by perch and the manual 'left join' above
            queryBuilder.andWhere(`to_tsquery(:query) @@ (
                setweight(to_tsvector('pg_catalog.english', coalesce("${queryBuilder.alias}".name, '')), 'A') ||
                setweight(to_tsvector('pg_catalog.english', coalesce("${queryBuilder.alias}".description, '')), 'C') ||
                to_tsvector('pg_catalog.english', coalesce(CASE WHEN "${queryBuilder.alias}"."isNSFW" THEN 'NSFW' END, '')) ||
                to_tsvector(tags.name)
            )`, {query: toTsQuery(query)});
        }

        createInfoSelectQueryBuilder(options, this.repository, queryBuilder);

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
        options?: ServiceFindOptionsParameter<HBThemeEntity>,
    ): Promise<HBThemeEntity[]> {
        const queryBuilder = this.repository.createQueryBuilder();
        const findConditions: FindConditions<HBThemeEntity> = {};

        if (includeNSFW != true) {
            findConditions.isNSFW = false;
        }

        queryBuilder
            .where(findConditions)
            .orderBy("RANDOM()");

        if (limit != undefined) {
            queryBuilder.limit(limit);
        }

        createInfoSelectQueryBuilder(options, this.repository);

        return queryBuilder.getMany();
    }

    async isOwner(hbthemeId: string, userId: string): Promise<boolean> {
        return !!(await exists(
            this.repository.createQueryBuilder()
                .where({id: hbthemeId, creatorId: userId}),
        ));
    }

    async getHash(hbthemeId: string): Promise<string> {
        const hashEntity = await this.hashRepository.createQueryBuilder()
            .where({hbthemeId})
            .getOne();
        return hashEntity.hashString;
    }

}