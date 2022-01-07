import {PackEntity} from "./Pack.entity";
import {FindConditions, getConnection, In, Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {Target} from "../common/enums/Target";
import {InjectRepository} from "@nestjs/typeorm";
import {SortOrder} from "../common/enums/SortOrder";
import {executeManyRawAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSort} from "../common/args/ItemSort.args";
import {toTsQuery} from "../common/TsQueryCreator";
import {ThemeEntity} from "../Theme/Theme.entity";
import {HBThemeEntity} from "../HBTheme/HBTheme.entity";
import {ServiceFindOptionsParameter} from "../common/interfaces/ServiceFindOptions.parameter";
import {IsOwner} from "../common/interfaces/IsOwner.interface";
import {exists} from "../common/functions/exists";
import {createInfoSelectQueryBuilder} from "../common/functions/createInfoSelectQueryBuilder";
import {LayoutEntity} from "../Layout/Layout.entity";
import {PackHashEntity} from "../Cache/Pack/PackHash.entity";
import {GetHash} from "../common/interfaces/GetHash.interface";
import {ThemeService} from "../Theme/Theme.service";
import {HBThemeService} from "../HBTheme/HBTheme.service";
import {MailService} from "../../mail/mail.service";
import {PackNotFoundError} from "../common/errors/PackNotFound.error";
import {addPrivateCondition} from "../common/functions/addPrivateCondition";
import {ItemVisibility} from "../common/enums/ItemVisibility";
import {recomputeNSFW, regeneratePreview} from "./Pack.constraints";
import {UserEntity} from "../User/User.entity";
import {UpdatePackDataInput} from "./dto/UpdatePackData.input";

@Injectable()
export class PackService implements IsOwner, GetHash {

    constructor(
        @InjectRepository(PackEntity) private repository: Repository<PackEntity>,
        @InjectRepository(PackHashEntity) private hashRepository: Repository<PackHashEntity>,
        private themeService: ThemeService,
        private hbthemeService: HBThemeService,
        private mailService: MailService,
    ) {
    }

    findOne(
        {id}: { id: string },
        options?: ServiceFindOptionsParameter<PackEntity>,
    ): Promise<PackEntity> {
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository);
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
            visibility = new ItemVisibility(),
        }:
            {
                paginationArgs?: PaginationArgs,
                sort?: ItemSort,
                order?: SortOrder,
                query?: string,
                target?: Target,
                creators?: string[],
                includeNSFW?: boolean
                visibility?: ItemVisibility,
            },
        options?: ServiceFindOptionsParameter<PackEntity>,
    ): Promise<{ result: PackEntity[], count: number }> {
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository);
        const findConditions: FindConditions<PackEntity> = {};

        if (creators?.length > 0) {
            findConditions.creator = {
                id: In(creators),
            };
        }

        if (includeNSFW != true) {
            findConditions.isNSFW = false;
        }

        queryBuilder.where(findConditions);

        if (query?.length > 0) {
            queryBuilder.andWhere(`to_tsquery(:query) @@ (
                setweight(to_tsvector('pg_catalog.english', coalesce("${queryBuilder.alias}".name, '')), 'A') ||
                setweight(to_tsvector('pg_catalog.english', coalesce("${queryBuilder.alias}".description, '')), 'C') ||
                to_tsvector('pg_catalog.english', coalesce(CASE WHEN "${queryBuilder.alias}"."isNSFW" THEN 'NSFW' END, ''))
            )`, {query: toTsQuery(query)});
        }

        queryBuilder.orderBy({[`"${queryBuilder.alias}"."${sort}"`]: order});

        addPrivateCondition(queryBuilder, visibility);

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
        options?: ServiceFindOptionsParameter<PackEntity>,
    ): Promise<PackEntity[]> {
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository);
        const findConditions: FindConditions<PackEntity> = {};

        findConditions.isPrivate = false;

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
        return !!(await exists(
            this.repository.createQueryBuilder()
                .where({id: packId, creatorId: userId}),
        ));
    }

    async getHash(id: string): Promise<string> {
        const hashEntity = await this.hashRepository.createQueryBuilder()
            .where({id})
            .getOne();
        return hashEntity?.hashString;
    }

    async delete(ids: string[]) {
        await this.repository.manager.transaction(async () => {
            await this.repository.delete({id: In(ids)});
            await this.themeService.delete({packIds: ids});
            await this.hbthemeService.delete({packIds: ids});
        });
    }

    async setVisibility(id: string, makePrivate: boolean, reason: string) {
        await this.repository.manager.transaction(async entityManager => {
            const pack = await this.findOne({id}, {
                relations: {
                    creator: true,
                    previews: true,
                },
            });

            if (!pack) {
                throw new PackNotFoundError();
            }

            pack.isPrivate = makePrivate;
            await entityManager.save(PackEntity, pack);
            await this.themeService.setVisibility({packId: id}, makePrivate, reason);
            await this.hbthemeService.setVisibility({packId: id}, makePrivate, reason);
            await regeneratePreview(entityManager, id);
            try {
                // only send email if a reason was provided (meaning an admin did this)
                if (reason) {
                    await this.mailService.sendPackPrivatedByAdmin(pack, reason);
                }
            } catch (e) {
                console.error(e);
            }
        });
    }

    async update(id: string, data: UpdatePackDataInput) {
        const pack = await this.repository.findOne({
            where: {id},
            relations: [
                "creator",
                "previews",
                "themes",
                "hbthemes",
                "themes.previews",
                "themes.assets",
                "hbthemes.previews",
                "hbthemes.assets"
            ],
        });
        await getConnection().manager.transaction(async entityManager => {
            if (!pack) {
                throw new PackNotFoundError();
            }
            if (data.name !== undefined) {
                pack.name = data.name;
            }
            if (data.description !== undefined) {
                pack.description = data.description;
            }
            if (data.preview === null) {
                await pack.previews.generateCollage(pack.themes, pack.hbthemes);
                pack.previews.isCustom = false;
            } else if (data.preview !== undefined) {
                await pack.previews.generateFromStream((await data.preview).createReadStream);
            }
            await entityManager.save(PackEntity, pack);
        });
    }

    async addToPack(id: string, themeIds: string[], hbthemeIds: string[], user: UserEntity) {
        await getConnection().transaction(async (entityManager) => {
            await entityManager.createQueryBuilder()
                .update(ThemeEntity)
                .set({packId: id})
                .where({id: In(themeIds)})
                .andWhere(
                    "\"creatorId\" = :userId OR :isAdmin", {
                        userId: user.id,
                        isAdmin: user.isAdmin,
                    })
                .execute();

            await entityManager.createQueryBuilder()
                .update(HBThemeEntity)
                .set({packId: id})
                .where({id: In(hbthemeIds)})
                .andWhere(
                    "\"creatorId\" = :userId OR :isAdmin", {
                        userId: user.id,
                        isAdmin: user.isAdmin,
                    })
                .execute();

            await recomputeNSFW(entityManager, {packId: id});
            await regeneratePreview(entityManager, id);
        });
    }

    async removeFromPack(id: string, themeIds: string[], hbthemeIds: string[], user: UserEntity) {
        await getConnection().transaction(async (entityManager) => {
            await entityManager.createQueryBuilder()
                .update(ThemeEntity)
                .set({packId: null})
                .where({id: In(themeIds)})
                .andWhere(
                    "\"creatorId\" = :userId OR :isAdmin", {
                        userId: user.id,
                        isAdmin: user.isAdmin,
                    })
                .execute();

            await entityManager.createQueryBuilder()
                .update(HBThemeEntity)
                .set({packId: null})
                .where({id: In(hbthemeIds)})
                .andWhere(
                    "\"creatorId\" = :userId OR :isAdmin", {
                        userId: user.id,
                        isAdmin: user.isAdmin,
                    })
                .execute();

            await recomputeNSFW(entityManager, {packId: id});
            await regeneratePreview(entityManager, id);
        });
    }

}