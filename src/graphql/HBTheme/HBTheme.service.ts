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
import {MailService} from "../../mail/mail.service";
import {OtherError} from "../common/errors/Other.error";
import {HBThemeNotFoundError} from "../common/errors/HBThemeNotFound.error";
import {ItemVisibility} from "../common/enums/ItemVisibility";
import {addPrivateCondition} from "../common/functions/addPrivateCondition";

@Injectable()
export class HBThemeService implements IsOwner, GetHash {

    constructor(
        @InjectRepository(HBThemeEntity) private repository: Repository<HBThemeEntity>,
        @InjectRepository(HBThemeHashEntity) private hashRepository: Repository<HBThemeHashEntity>,
        private mailService: MailService,
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
        const queryBuilder = this.repository.createQueryBuilder();
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

        createInfoSelectQueryBuilder(options, this.repository, queryBuilder);

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
            visibility = new ItemVisibility(),
        }:
            {
                packId?: string,
                paginationArgs?: PaginationArgs,
                sort?: ItemSort,
                order?: SortOrder,
                query?: string,
                creators?: string[],
                includeNSFW?: boolean
                visibility?: ItemVisibility,
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
            .orderBy({[`"${queryBuilder.alias}"."${sort}"`]: order});

        if (query?.length > 0) {
            queryBuilder.andWhere(`to_tsquery(:query) @@ (
                setweight(to_tsvector('pg_catalog.english', coalesce("${queryBuilder.alias}".name, '')), 'A') ||
                setweight(to_tsvector('pg_catalog.english', coalesce("${queryBuilder.alias}".description, '')), 'C') ||
                to_tsvector('pg_catalog.english', coalesce(CASE WHEN "${queryBuilder.alias}"."isNSFW" THEN 'NSFW' END, '')) ||
                to_tsvector(tags.name)
            )`, {query: toTsQuery(query)});
        }

        addPrivateCondition(queryBuilder, visibility);

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

        findConditions.isPrivate = false;

        queryBuilder
            .where(findConditions)
            .orderBy("RANDOM()");

        if (limit != undefined) {
            queryBuilder.limit(limit);
        }

        createInfoSelectQueryBuilder(options, this.repository, queryBuilder);

        return queryBuilder.getMany();
    }

    async isOwner(id: string, userId: string): Promise<boolean> {
        return !!(await exists(
            this.repository.createQueryBuilder()
                .where({id, creatorId: userId}),
        ));
    }

    async getHash(id: string): Promise<string> {
        const hashEntity = await this.hashRepository.createQueryBuilder()
            .where({id})
            .getOne();
        return hashEntity?.hashString;
    }

    async delete({ids, packIds}: { ids?: string[], packIds?: string[] } = {}) {
        const findConditions: FindConditions<HBThemeEntity> = {};

        if (ids) {
            findConditions.id = In(ids);
        }
        if (packIds) {
            findConditions.packId = In(packIds);
        }

        await this.repository.delete(findConditions);
    }

    async setVisibility({id, packId}: { id?: string, packId?: string }, makePrivate: boolean, reason: string) {
        if (packId) {
            // this is called from PackService, so force set the visibility and don't send any emails or whatever
            await this.repository.update({packId}, {
                isPrivate: makePrivate,
                updatedTimestamp: () => "\"updatedTimestamp\"",
            });
        } else {
            await this.repository.manager.transaction(async () => {
                const theme = await this.repository.findOne({
                    where: {id},
                    relations: ["creator", "previews"],
                });

                if (!theme) {
                    throw new HBThemeNotFoundError();
                }
                if (theme.packId) {
                    throw new OtherError("Cannot set visibility of a hbtheme that is part of a pack");
                }

                theme.isPrivate = makePrivate;
                await theme.save();
                try {
                    if (reason) {
                        await this.mailService.sendThemePrivatedByAdmin(theme, reason);
                    }
                } catch (e) {
                    console.error(e);
                }
            });
        }
    }

}