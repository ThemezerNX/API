import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FindConditions, In, Repository} from "typeorm";
import {ThemeEntity} from "./Theme.entity";
import {executeAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {Target} from "../common/enums/Target";
import {SortOrder} from "../common/enums/SortOrder";
import {ItemSort} from "../common/args/ItemSort.args";
import {toTsQuery} from "../common/TsQueryCreator";
import {IsOwner} from "../common/interfaces/IsOwner.interface";
import {Exists} from "../common/findOperators/Exists";
import {ThemeData} from "./dto/ThemeData.input";
import {PackData} from "./dto/PackData.input";
import {ThemeTagEntity} from "../ThemeTag/ThemeTag.entity";
import {ThemePreviewsEntity} from "./Previews/ThemePreviews.entity";
import {ThemeAssetsEntity} from "./Assets/ThemeAssets.entity";
import {InvalidThemeContentsError} from "../common/errors/InvalidThemeContents.error";
import {streamToBuffer} from "@jorgeferrero/stream-to-buffer";
import {ThemeOptionEntity} from "./ThemeOptions/ThemeOption.entity";
import {LayoutOptionService} from "../LayoutOption/LayoutOption.service";
import {LayoutOptionType} from "../LayoutOption/common/LayoutOptionType.enum";
import {LayoutNotFoundError} from "../common/errors/LayoutNotFound.error";
import {CreatorNotFoundError} from "../common/errors/CreatorNotFound.error";
import {ServiceFindOptionsParameter} from "../common/interfaces/ServiceFindOptions.parameter";
import {createInfoSelectQueryBuilder} from "../common/functions/CreateInfoSelectQueryBuilder";
import {ThemeHashEntity} from "../Cache/Theme/ThemeHash.entity";
import {GetHash} from "../common/interfaces/GetHash.interface";

@Injectable()
export class ThemeService implements IsOwner, GetHash {

    constructor(
        @InjectRepository(ThemeEntity) private repository: Repository<ThemeEntity>,
        @InjectRepository(ThemeHashEntity) private hashRepository: Repository<ThemeHashEntity>,
        private layoutOptionService: LayoutOptionService,
    ) {
    }

    findOne({
                id,
                isNSFW,
                packId,
            }: {
                id?: string,
                isNSFW?: boolean,
                packId?: string
            },
            options?: ServiceFindOptionsParameter<ThemeEntity, ThemePreviewsEntity, ThemeAssetsEntity>,
    ): Promise<ThemeEntity> {
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository, {hasPreviews: true, hasAssets: true});
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

        queryBuilder
            .where(findConditions);

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
        options?: ServiceFindOptionsParameter<ThemeEntity, ThemePreviewsEntity, ThemeAssetsEntity>,
    ) {
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository, {hasPreviews: true, hasAssets: true});
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
            target,
            includeNSFW,
        }:
            {
                limit?: number,
                target?: Target,
                includeNSFW?: boolean
            },
        options?: ServiceFindOptionsParameter<ThemeEntity, ThemePreviewsEntity, ThemeAssetsEntity>,
    ): Promise<ThemeEntity[]> {
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository, {hasPreviews: true, hasAssets: true});
        const findConditions: FindConditions<ThemeEntity> = {};

        if (target != undefined) {
            findConditions.target = target;
        }
        if (includeNSFW != true) {
            findConditions.isNSFW = false;
        }

        queryBuilder
            .where(findConditions)
            .orderBy("RANDOM()");

        if (limit != undefined) {
            queryBuilder.limit(limit);
        }

        return queryBuilder.getMany();
    }

    async isOwner(themeId: string, userId: string): Promise<boolean> {
        return !!(await Exists(
            this.repository.createQueryBuilder()
                .where({id: themeId, creatorId: userId}),
        ));
    }

    async getHash(themeId: string): Promise<string> {
        const hashEntity = await this.hashRepository.createQueryBuilder()
            .where({id: themeId})
            .getOne();
        return hashEntity.hashString;
    }

}