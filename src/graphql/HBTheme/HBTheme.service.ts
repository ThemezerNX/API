import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FindConditions, getConnection, In, Repository} from "typeorm";
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
import {deleteIfEmpty, recomputeNSFW} from "../Pack/Pack.constraints";
import {ThemeTagEntity} from "../ThemeTag/ThemeTag.entity";
import {selectTags} from "../common/functions/selectTags";
import {UpdateHBThemeDataInput} from "./dto/UpdateHBThemeDataInput";
import {HBThemeAssetsEntity} from "./Assets/HBThemeAssets.entity";
import {readImageAsset} from "../common/functions/readImageAsset";
import {insertOrUpdateTags} from "../common/functions/insertOrUpdateTags";

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
            looseOnly,
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
                looseOnly?: boolean
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
        if (looseOnly) {
            findConditions.packId = null;
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

        await this.repository.manager.transaction(async entityManager => {
            const usedPackIds = (await entityManager.find(HBThemeEntity, findConditions)).map(theme => theme.packId);
            const usedPackIdsSet = new Set(usedPackIds);

            await entityManager.delete(HBThemeEntity, findConditions);
            for (const packId of usedPackIdsSet || []) {
                // if there are less than 2 items left in the pack, delete the pack
                await deleteIfEmpty(entityManager, packId);
            }
        });
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

    async update(id: string, data: UpdateHBThemeDataInput) {
        const theme = await this.repository.findOne({
            where: {id},
            relations: ["creator", "previews", "assets", "tags"],
        });
        await getConnection().manager.transaction(async entityManager => {
            if (!theme) {
                throw new HBThemeNotFoundError();
            }
            if (data.name !== undefined) {
                theme.name = data.name;
            }
            if (data.description !== undefined) {
                theme.description = data.description;
            }
            if (data.isNSFW !== undefined) {
                theme.isNSFW = data.isNSFW;
            }
            const insertedTags: ThemeTagEntity[] = theme.tags;
            if (data.tags === null || data.tags === []) {
                theme.tags = [];
            } else if (data.tags !== undefined) {
                theme.tags = selectTags(data.tags, insertedTags);

                for (const tag of theme.tags) {
                    if (!insertedTags.map((t: ThemeTagEntity) => t.name).includes(tag.name)) {
                        insertedTags.push(tag);
                    }
                }
            }

            if (data.screenshot !== undefined) {
                await theme.previews.generateFromStream((await data.screenshot).createReadStream);
            }
            if (data.assets !== undefined) {

                if (data.assets.icon === null) {
                    theme.assets.iconFile = null;
                } else if (data.assets.icon) {
                    theme.assets.iconFile = await readImageAsset(
                        data.assets,
                        "icon",
                        HBThemeAssetsEntity.ICON_FILE,
                    );
                }
                if (data.assets.batteryIcon === null) {
                    theme.assets.batteryIconFile = null;
                } else if (data.assets.batteryIcon) {
                    theme.assets.batteryIconFile = await readImageAsset(
                        data.assets,
                        "batteryIcon",
                        HBThemeAssetsEntity.BATTERY_ICON_FILE,
                    );
                }
                if (data.assets.chargingIcon === null) {
                    theme.assets.chargingIconFile = null;
                } else if (data.assets.chargingIcon) {
                    theme.assets.chargingIconFile = await readImageAsset(
                        data.assets,
                        "chargingIcon",
                        HBThemeAssetsEntity.CHARGING_ICON_FILE,
                    );
                }
                if (data.assets.folderIcon === null) {
                    theme.assets.folderIconFile = null;
                } else if (data.assets.folderIcon) {
                    theme.assets.folderIconFile = await readImageAsset(
                        data.assets,
                        "folderIcon",
                        HBThemeAssetsEntity.FOLDER_ICON_FILE,
                    );
                }
                if (data.assets.invalidIcon === null) {
                    theme.assets.invalidIconFile = null;
                } else if (data.assets.invalidIcon) {
                    theme.assets.invalidIconFile = await readImageAsset(
                        data.assets,
                        "invalidIcon",
                        HBThemeAssetsEntity.INVALID_ICON_FILE,
                    );
                }
                if (data.assets.themeIconDark === null) {
                    theme.assets.themeIconDarkFile = null;
                } else if (data.assets.themeIconDark) {
                    theme.assets.themeIconDarkFile = await readImageAsset(
                        data.assets,
                        "themeIconDark",
                        HBThemeAssetsEntity.THEME_ICON_DARK_FILE,
                    );
                }
                if (data.assets.themeIconLight === null) {
                    theme.assets.themeIconLightFile = null;
                } else if (data.assets.themeIconLight) {
                    theme.assets.themeIconLightFile = await readImageAsset(
                        data.assets,
                        "themeIconLight",
                        HBThemeAssetsEntity.THEME_ICON_LIGHT_FILE,
                    );
                }
                if (data.assets.airplaneIcon === null) {
                    theme.assets.airplaneIconFile = null;
                } else if (data.assets.airplaneIcon) {
                    theme.assets.airplaneIconFile = await readImageAsset(
                        data.assets,
                        "airplaneIcon",
                        HBThemeAssetsEntity.AIRPLANE_ICON_FILE,
                    );
                }
                if (data.assets.wifiNoneIcon === null) {
                    theme.assets.wifiNoneIconFile = null;
                } else if (data.assets.wifiNoneIcon) {
                    theme.assets.wifiNoneIconFile = await readImageAsset(
                        data.assets,
                        "wifiNoneIcon",
                        HBThemeAssetsEntity.WIFI_NONE_ICON_FILE,
                    );
                }
                if (data.assets.wifi1Icon === null) {
                    theme.assets.wifi1IconFile = null;
                } else if (data.assets.wifi1Icon) {
                    theme.assets.wifi1IconFile = await readImageAsset(
                        data.assets,
                        "wifi1Icon",
                        HBThemeAssetsEntity.WIFI1_ICON_FILE,
                    );
                }
                if (data.assets.wifi2Icon === null) {
                    theme.assets.wifi2IconFile = null;
                } else if (data.assets.wifi2Icon) {
                    theme.assets.wifi2IconFile = await readImageAsset(
                        data.assets,
                        "wifi2Icon",
                        HBThemeAssetsEntity.WIFI2_ICON_FILE,
                    );
                }
                if (data.assets.wifi3Icon === null) {
                    theme.assets.wifi3IconFile = null;
                } else if (data.assets.wifi3Icon) {
                    theme.assets.wifi3IconFile = await readImageAsset(
                        data.assets,
                        "wifi3Icon",
                        HBThemeAssetsEntity.WIFI3_ICON_FILE,
                    );
                }
                if (data.assets.ethIcon === null) {
                    theme.assets.ethIconFile = null;
                } else if (data.assets.ethIcon) {
                    theme.assets.ethIconFile = await readImageAsset(
                        data.assets,
                        "ethIcon",
                        HBThemeAssetsEntity.ETH_ICON_FILE,
                    );
                }
                if (data.assets.ethNoneIcon === null) {
                    theme.assets.ethNoneIconFile = null;
                } else if (data.assets.ethNoneIcon) {
                    theme.assets.ethNoneIconFile = await readImageAsset(
                        data.assets,
                        "ethNoneIcon",
                        HBThemeAssetsEntity.ETH_NONE_ICON_FILE,
                    );
                }
                if (data.assets.backgroundImage === null) {
                    theme.assets.backgroundImageFile = null;
                } else if (data.assets.backgroundImage) {
                    theme.assets.backgroundImageFile = await readImageAsset(
                        data.assets,
                        "backgroundImage",
                        HBThemeAssetsEntity.BACKGROUND_IMAGE_FILE,
                    );
                }

                if (data.assets.backgroundImage !== undefined) {
                    await theme.assets.setImage((await data.assets.backgroundImage).createReadStream);
                }
            }

            await insertOrUpdateTags(entityManager, insertedTags);
            await entityManager.save(HBThemeEntity, theme);
            if (theme.packId) {
                await recomputeNSFW(entityManager, {packId: theme.packId});
            }
        });
    }

}