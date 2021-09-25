import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FindConditions, In, Repository} from "typeorm";
import {ThemeEntity} from "./Theme.entity";
import {executeAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {Target} from "../common/enums/Target";
import {SortOrder} from "../common/enums/SortOrder";
import {ItemSort} from "../common/args/ItemSortArgs";
import {toTsQuery} from "../common/TsQueryCreator";

@Injectable()
export class ThemeService {

    constructor(@InjectRepository(ThemeEntity) private repository: Repository<ThemeEntity>) {
    }

    findOne({
                id,
                isNSFW,
                packId,
            }: { id?: string, isNSFW?: boolean, packId?: string }, relations: string[] = [], selectImageFiles: boolean = false): Promise<ThemeEntity> {
        const findConditions: FindConditions<ThemeEntity> = {};

        if (id != undefined) {
            findConditions.id = id;
        }
        if (isNSFW != undefined) {
            findConditions.isNSFW = isNSFW;
        }
        if (packId != undefined) {
            findConditions.packId = packId;
        }

        const queryBuilder = this.repository.createQueryBuilder("theme")
            .where(findConditions);

        for (const relation of relations) {
            queryBuilder.leftJoinAndSelect("theme." + relation, relation);
        }

        if (selectImageFiles) {
            queryBuilder.addSelect([
                "previews.image720File",
                "previews.image360File",
                "previews.image240File",
                "previews.image180File",
                "previews.imagePlaceholderFile",
            ]);
        }

        return queryBuilder.getOne();
    }

    findAll(
        {
            packId,
            paginationArgs,
            sort = ItemSort.ADDED,
            order = SortOrder.DESC,
            target,
            query,
            creators,
            layouts,
            includeNSFW,
        }:
            {
                packId?: string,
                paginationArgs?: PaginationArgs,
                sort?: ItemSort,
                order?: SortOrder,
                query?: string,
                target?: Target,
                creators?: string[],
                layouts?: string[],
                includeNSFW?: Boolean
            },
    ) {
        const findConditions: FindConditions<ThemeEntity> = {};

        if (packId != undefined) {
            findConditions.packId = packId;
        }
        if (target != undefined) {
            findConditions.target = target;
        }
        if (creators?.length > 0) {
            findConditions.creator = {
                id: In(creators),
            };
        }
        if (layouts?.length > 0) {
            findConditions.layout = {
                id: In(layouts),
            };
        }
        if (includeNSFW != true) {
            findConditions.isNSFW = false;
        }

        const queryBuilder = this.repository.createQueryBuilder("theme")
            .where(findConditions)
            .leftJoinAndSelect("theme.previews", "previews")
            .leftJoinAndSelect("theme.assets", "assets")
            .leftJoinAndSelect("theme.tags", "tags")
            .orderBy({["theme." + sort]: order});

        if (query?.length > 0) {
            queryBuilder.andWhere(`to_tsquery(:query) @@ (
                setweight(to_tsvector('pg_catalog.english', coalesce(theme.name, '')), 'A') ||
                setweight(to_tsvector('pg_catalog.english', coalesce(theme.description, '')), 'C') ||
                to_tsvector('pg_catalog.english', coalesce(CASE WHEN theme."isNSFW" THEN 'NSFW' END, '')) ||
                to_tsvector(tags.name)
            )`, {query: toTsQuery(query)});
        }

        return executeAndPaginate(paginationArgs, queryBuilder);
    }

    findRandom(
        {
            limit,
            target,
            includeNSFW,
        }:
            {
                limit?: number,
                target?: Target,
                includeNSFW?: boolean
            },
    ): Promise<ThemeEntity[]> {
        const findConditions: FindConditions<ThemeEntity> = {};

        if (target != undefined) {
            findConditions.target = target;
        }
        if (includeNSFW != true) {
            findConditions.isNSFW = false;
        }

        const queryBuilder = this.repository.createQueryBuilder("theme")
            .where(findConditions)
            .leftJoinAndSelect("theme.previews", "previews")
            .leftJoinAndSelect("theme.assets", "assets")
            .leftJoinAndSelect("theme.tags", "tags")
            .orderBy("RANDOM()");

        if (limit != undefined) {
            queryBuilder.limit(limit);
        }

        return queryBuilder.getMany();
    }

}