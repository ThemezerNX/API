import {PackEntity} from "./Pack.entity";
import {FindConditions, In, Repository, SelectQueryBuilder} from "typeorm";
import {Injectable} from "@nestjs/common";
import {Target} from "../common/enums/Target";
import {InjectRepository} from "@nestjs/typeorm";
import {SortOrder} from "../common/enums/SortOrder";
import {executeManyRawAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSort} from "../common/args/ItemSort.args";
import {ThemeService} from "../Theme/Theme.service";
import {toTsQuery} from "../common/TsQueryCreator";
import {HBThemeService} from "../HBTheme/HBTheme.service";
import {ThemeEntity} from "../Theme/Theme.entity";
import {HBThemeEntity} from "../HBTheme/HBTheme.entity";
import {PerchQueryBuilder} from "perch-query-builder";
import {joinAndSelectRelations, selectPreviews} from "../common/functions/ServiceFunctions.js";
import {ServiceFindOptionsParameter} from "../common/interfaces/ServiceFindOptions.parameter";
import {IsOwner} from "../common/interfaces/IsOwner.interface";
import {Exists} from "../common/findOperators/Exists";
import {createInfoSelectQueryBuilder} from "../common/functions/CreateInfoSelectQueryBuilder";
import {PackPreviewsEntity} from "./Previews/PackPreviews.entity";
import {LayoutEntity} from "../Layout/Layout.entity";

@Injectable()
export class PackService implements IsOwner {

    constructor(
        @InjectRepository(PackEntity) private repository: Repository<PackEntity>,
        private themeService: ThemeService,
        private hbthemeService: HBThemeService,
    ) {
    }

    async isNSFW(packId: string): Promise<boolean> {
        const results = await Promise.all([
            await this.themeService.findOne({
                packId,
                isNSFW: true,
            }),
            await this.hbthemeService.findOne({
                packId,
                isNSFW: true,
            }),
        ]);

        return results.some((r) => r);
    }

    findOne(
        {id}: { id: string },
        options?: ServiceFindOptionsParameter<PackEntity, PackPreviewsEntity>,
    ): Promise<PackEntity> {
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository, {hasPreviews: true});
        const findConditions: FindConditions<LayoutEntity> = {};

        if (id != undefined) {
            findConditions.id = id;
        }

        return queryBuilder.where(findConditions).getOne();
    }

    async findAll(
        {
            paginationArgs,
            sort = ItemSort.ADDED,
            order = SortOrder.DESC,
            query,
            creators,
            includeNSFW,
        }:
            {
                paginationArgs?: PaginationArgs,
                sort?: ItemSort,
                order?: SortOrder,
                query?: string,
                target?: Target,
                creators?: string[],
                includeNSFW?: boolean
            },
        options?: ServiceFindOptionsParameter<PackEntity, PackPreviewsEntity>,
    ): Promise<{ result: PackEntity[], count: number }> {
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository, {hasPreviews: true});
        const findConditions: FindConditions<PackEntity> = {};

        if (creators?.length > 0) {
            findConditions.creator = {
                id: In(creators),
            };
        }

        queryBuilder.where(findConditions);

        queryBuilder.leftJoin((sq) =>
                sq
                    .subQuery()
                    .select("pack2.id", "nsfwpackid")
                    .from(PackEntity, "pack2")
                    .where("theme2.\"isNSFW\" OR hbtheme2.\"isNSFW\"")
                    .leftJoin(ThemeEntity, "theme2", "pack2.id = theme2.packId")
                    .leftJoin(HBThemeEntity, "hbtheme2", "pack2.id = hbtheme2.packId"),
            "nsfwtable",
            `${queryBuilder.alias}.id = nsfwtable.nsfwpackid`,
        );

        const isNSFW = "CASE WHEN nsfwtable.nsfwpackid is NULL THEN FALSE ELSE TRUE END";
        queryBuilder.addSelect(isNSFW, "isNSFW");

        if (includeNSFW != true) {
            queryBuilder.andWhere("nsfwtable.nsfwpackid IS NULL");
        }

        if (query?.length > 0) {
            queryBuilder.andWhere(`to_tsquery(:query) @@ (
                setweight(to_tsvector('pg_catalog.english', coalesce("${queryBuilder.alias}".name, '')), 'A') ||
                setweight(to_tsvector('pg_catalog.english', coalesce("${queryBuilder.alias}".description, '')), 'C') ||
                to_tsvector('pg_catalog.english', coalesce(CASE WHEN (${isNSFW}) THEN 'NSFW' END, ''))
            )`, {query: toTsQuery(query)});
        }

        queryBuilder.orderBy({[queryBuilder.alias + "." + sort]: order});

        const {result, count} = await executeManyRawAndPaginate(queryBuilder, paginationArgs);
        // map the isNSFW field
        result.entities.forEach((row, index) => {
            row.isNSFW = result.raw[index].isNSFW;
        });
        return {result: result.entities, count};
    }

    async findRandom(
        {
            limit,
            includeNSFW,
        }:
            {
                limit?: number,
                includeNSFW?: boolean
            },
        options?: ServiceFindOptionsParameter<PackEntity, PackPreviewsEntity>,
    ): Promise<PackEntity[]> {
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository, {hasPreviews: true});
        const findConditions: FindConditions<PackEntity> = {};

        queryBuilder.where(findConditions);

        queryBuilder.leftJoin((sq) =>
                sq
                    .subQuery()
                    .select("pack2.id", "nsfwpackid")
                    .from(PackEntity, "pack2")
                    .where("theme2.\"isNSFW\" OR hbtheme2.\"isNSFW\"")
                    .leftJoin(ThemeEntity, "theme2", "pack2.id = theme2.packId")
                    .leftJoin(HBThemeEntity, "hbtheme2", "pack2.id = hbtheme2.packId"),
            "nsfwtable",
            `${queryBuilder.alias}.id = nsfwtable.nsfwpackid`,
        );

        const isNSFW = "CASE WHEN nsfwtable.nsfwpackid is NULL THEN FALSE ELSE TRUE END";
        queryBuilder.addSelect(isNSFW, "isNSFW");

        if (includeNSFW != true) {
            queryBuilder.andWhere("nsfwtable.nsfwpackid IS NULL");
        }

        if (limit != undefined) {
            queryBuilder.limit(limit);
        }

        queryBuilder.orderBy("RANDOM()");

        const {raw, entities} = await queryBuilder.getRawAndEntities();
        // map the isNSFW field
        entities.forEach((row, index) => {
            row.isNSFW = raw[index].isNSFW;
        });
        return entities;
    }


    async isOwner(packId: string, userId: string): Promise<boolean> {
        return !!(await Exists(
            this.repository.createQueryBuilder()
                .where({id: packId, creatorId: userId}),
        ));
    }

}