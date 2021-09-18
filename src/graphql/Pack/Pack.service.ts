import {PackEntity} from "./Pack.entity";
import {FindConditions, In, Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {Target} from "../common/enums/Target";
import {InjectRepository} from "@nestjs/typeorm";
import {SortOrder} from "../common/enums/SortOrder";
import {executeAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSort} from "../common/args/ItemSortArgs";
import {ThemeService} from "../Theme/Theme.service";
import {toTsQuery} from "../common/TsQueryCreator";
import {HBThemeService} from "../HBTheme/HBTheme.service";
import {ThemeEntity} from "../Theme/Theme.entity";
import {HBThemeEntity} from "../HBTheme/HBTheme.entity";

@Injectable()
export class PackService {

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

    findOne({id}: { id: string }, relations: string[] = []): Promise<PackEntity> {
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
    ): Promise<[PackEntity[], number]> {
        const findConditions: FindConditions<PackEntity> = {};

        if (creators?.length > 0) {
            findConditions.creator = {
                id: In(creators),
            };
        }

        const queryBuilder = this.repository.createQueryBuilder("pack")
            .where(findConditions);

        if (includeNSFW != true) {
            queryBuilder.andWhere(qb => {
                const sub = qb.subQuery()
                    .select("theme2.isNSFW OR hbtheme2.isNSFW")
                    .from(PackEntity, "pack2")
                    .where("pack2.id = pack.id")
                    .leftJoin(ThemeEntity, "theme2", "pack2.id = theme2.packId")
                    .leftJoin(HBThemeEntity, "hbtheme2", "pack2.id = hbtheme2.packId");
                return "TRUE NOT IN" + sub.getQuery();
            });
        }

        if (query?.length > 0) {
            queryBuilder.andWhere(`to_tsquery(:query) @@ (
                setweight(to_tsvector('pg_catalog.english', coalesce(pack.name, '')), 'A') ||
                setweight(to_tsvector('pg_catalog.english', coalesce(pack.description, '')), 'C') ||
                to_tsvector('pg_catalog.english', coalesce(CASE WHEN themes."isNSFW" OR hbthemes."isNSFW" THEN 'NSFW' END, ''))
            )`, {query: toTsQuery(query)});
        }

        queryBuilder
            .leftJoinAndSelect("pack.themes", "themes")
            .leftJoinAndSelect("pack.hbThemes", "hbthemes")
            .leftJoinAndSelect("pack.previews", "previews")
            .orderBy({["pack." + sort]: order});

        return executeAndPaginate(paginationArgs, queryBuilder);
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
    ): Promise<PackEntity[]> {
        const queryBuilder = this.repository.createQueryBuilder("pack");

        if (includeNSFW != true) {
            queryBuilder.andWhere(qb => {
                const sub = qb.subQuery()
                    .select("theme2.isNSFW OR hbtheme2.isNSFW")
                    .from(PackEntity, "pack2")
                    .where("pack2.id = pack.id")
                    .leftJoin(ThemeEntity, "theme2", "pack2.id = theme2.packId")
                    .leftJoin(HBThemeEntity, "hbtheme2", "pack2.id = hbtheme2.packId");
                return "TRUE NOT IN" + sub.getQuery();
            });
        }

        if (limit != undefined) {
            queryBuilder.limit(limit);
        }

        queryBuilder
            .leftJoinAndSelect("pack.themes", "themes")
            .leftJoinAndSelect("pack.hbThemes", "hbthemes")
            .leftJoinAndSelect("pack.previews", "previews")
            .orderBy("RANDOM()");

        return queryBuilder.getMany();
    }

}