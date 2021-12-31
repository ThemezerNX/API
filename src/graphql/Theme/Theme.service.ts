import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {titleCase} from "title-case";
import {FindConditions, getConnection, In, Repository} from "typeorm";
import {ThemeEntity} from "./Theme.entity";
import {executeAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {compareTargetFn, Target} from "../common/enums/Target";
import {SortOrder} from "../common/enums/SortOrder";
import {ItemSort} from "../common/args/ItemSort.args";
import {toTsQuery} from "../common/TsQueryCreator";
import {IsOwner} from "../common/interfaces/IsOwner.interface";
import {exists} from "../common/functions/exists";
import {ThemeDataInput} from "./dto/ThemeData.input";
import {PackDataInput} from "./dto/PackData.input";
import {ThemeTagEntity} from "../ThemeTag/ThemeTag.entity";
import {ThemePreviewsEntity} from "./Previews/ThemePreviews.entity";
import {ThemeAssetsEntity} from "./Assets/ThemeAssets.entity";
import {InvalidThemeContentsError} from "../common/errors/InvalidThemeContents.error";
import {streamToBuffer} from "@jorgeferrero/stream-to-buffer";
import {ThemeOptionEntity} from "./ThemeOptions/ThemeOption.entity";
import {LayoutOptionService} from "../LayoutOption/LayoutOption.service";
import {LayoutOptionType} from "../LayoutOption/common/LayoutOptionType.enum";
import {LayoutNotFoundError} from "../common/errors/LayoutNotFound.error";
import {ServiceFindOptionsParameter} from "../common/interfaces/ServiceFindOptions.parameter";
import {createInfoSelectQueryBuilder} from "../common/functions/createInfoSelectQueryBuilder";
import {ThemeHashEntity} from "../Cache/Theme/ThemeHash.entity";
import {GetHash} from "../common/interfaces/GetHash.interface";
import {ThemeAssetsDataInput} from "./dto/ThemeAssetsData.input";
import * as sharp from "sharp";
import {propertyToTitleCase} from "../common/functions/propertyToTitleCase";
import {PackEntity} from "../Pack/Pack.entity";
import {PackPreviewsEntity} from "../Pack/Previews/PackPreviews.entity";
import {InvalidIconAssetError} from "../common/errors/InvalidIconAsset.error";
import {WebhookService} from "../../webhook/Webhook.service";
import {UserEntity} from "../User/User.entity";
import {HBThemeEntity} from "../HBTheme/HBTheme.entity";
import {HBThemeDataInput} from "./dto/HBThemeData.input";
import {HBThemePreviewsEntity} from "../HBTheme/Previews/HBThemePreviews.entity";
import {HBThemeAssetsEntity} from "../HBTheme/Assets/HBThemeAssets.entity";
import {HBThemeAssetsDataInput} from "./dto/HBThemeAssetsData.input";
import {PackMinThemesError} from "../common/errors/submissions/PackMinThemes.error";
import {NoThemesError} from "../common/errors/submissions/NoThemes.error";
import {HBThemeLightColorSchemeEntity} from "../HBTheme/ColorScheme/HBThemeLightColorScheme.entity";
import {HBThemeDarkColorSchemeEntity} from "../HBTheme/ColorScheme/HBThemeDarkColorScheme.entity";

@Injectable()
export class ThemeService implements IsOwner, GetHash {

    constructor(
        @InjectRepository(ThemeEntity) private repository: Repository<ThemeEntity>,
        @InjectRepository(ThemeHashEntity) private hashRepository: Repository<ThemeHashEntity>,
        private layoutOptionService: LayoutOptionService,
        private webhookService: WebhookService,
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
            options?: ServiceFindOptionsParameter<ThemeEntity>,
    ): Promise<ThemeEntity> {
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository);
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
        options?: ServiceFindOptionsParameter<ThemeEntity>,
    ) {
        const queryBuilder = this.repository.createQueryBuilder()
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
            .orderBy({[`"${queryBuilder.alias}"."${sort}"`]: order});

        if (query?.length > 0) {
            queryBuilder.andWhere(`to_tsquery(:query) @@ (
                setweight(to_tsvector('pg_catalog.english', coalesce("${queryBuilder.alias}".name, '')), 'A') ||
                setweight(to_tsvector('pg_catalog.english', coalesce("${queryBuilder.alias}".description, '')), 'C') ||
                to_tsvector('pg_catalog.english', coalesce(CASE WHEN "${queryBuilder.alias}"."isNSFW" THEN 'NSFW' END, '')) ||
                to_tsvector(tags.name)
            )`, {query: toTsQuery(query)});
        }

        createInfoSelectQueryBuilder(options, this.repository);

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
        options?: ServiceFindOptionsParameter<ThemeEntity>,
    ): Promise<ThemeEntity[]> {
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository);
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

    private static selectTags(newTags: string[], existingTags: ThemeTagEntity[]) {
        return newTags.map((tag) => {
            const tileCaseTag = titleCase(tag);
            return existingTags.find((t) => t.name === tileCaseTag) || new ThemeTagEntity(tileCaseTag);
        });
    }

    async insertMultiple(creator: UserEntity, themeData: ThemeDataInput[], hbthemeData: HBThemeDataInput[], packData: PackDataInput) {
        if (packData && themeData.length + hbthemeData.length < 2) {
            throw new PackMinThemesError({amount: 2});
        } else if (themeData.length + hbthemeData.length == 0) {
            throw new NoThemesError();
        }
        try {
            let insertedPack: PackEntity = null;
            const insertedThemes: ThemeEntity[] = [];
            const insertedHbthemes: HBThemeEntity[] = [];
            const insertedTags: ThemeTagEntity[] = [];
            const insertedHbTags: ThemeTagEntity[] = [];
            await getConnection().manager.transaction(async entityManager => {
                // Pack --------------------------------------------------------------------
                if (packData) {
                    insertedPack = PackEntity.create({
                        creator: creator,
                        name: packData.name,
                        description: packData.description,
                        previews: new PackPreviewsEntity(),
                        isNSFW: themeData.some(theme => theme.isNSFW),
                    });
                }

                // Themes ------------------------------------------------------------------
                for (const submittedTheme of themeData) {
                    const theme = ThemeEntity.create({
                        name: submittedTheme.name,
                        description: submittedTheme.description,
                        target: submittedTheme.target,
                        isNSFW: submittedTheme.isNSFW,
                        creator: creator,
                        layoutId: submittedTheme.layoutId || null,
                        // find the tag in the array
                        tags: ThemeService.selectTags(submittedTheme.tags, insertedTags),
                        previews: new ThemePreviewsEntity(),
                        assets: new ThemeAssetsEntity(),
                    });

                    // previews
                    await theme.previews.generateFromStream((await submittedTheme.screenshot).createReadStream);

                    // assets
                    if (!(submittedTheme.assets?.backgroundImage || submittedTheme.layoutId || submittedTheme.assets?.customLayoutJson || submittedTheme.assets?.customCommonLayoutJson)) {
                        // theme require at least either image or layout
                        throw new InvalidThemeContentsError({}, "themes require an image, a layout, or both");
                    }
                    if (!!submittedTheme.layoutId && !!(submittedTheme.assets?.customLayoutJson || submittedTheme.assets?.customCommonLayoutJson)) {
                        // can't have custom layout AND layoutId
                        throw new InvalidThemeContentsError(
                            {}, "layoutId cannot be combined with customLayoutJson or customCommonLayoutJson",
                        );
                    } else {
                        theme.assets.customLayoutJson = submittedTheme.assets?.customLayoutJson;
                        theme.assets.customCommonLayoutJson = submittedTheme.assets?.customCommonLayoutJson;
                    }

                    if (submittedTheme.assets?.homeIcon) {
                        theme.assets.homeIconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "homeIcon",
                            ThemeAssetsEntity.HOME_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets?.albumIcon) {
                        theme.assets.albumIconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "albumIcon",
                            ThemeAssetsEntity.ALBUM_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets?.newsIcon) {
                        theme.assets.newsIconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "newsIcon",
                            ThemeAssetsEntity.NEWS_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets?.shopIcon) {
                        theme.assets.shopIconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "shopIcon",
                            ThemeAssetsEntity.SHOP_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets?.controllerIcon) {
                        theme.assets.controllerIconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "controllerIcon",
                            ThemeAssetsEntity.CONTROLLER_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets?.settingsIcon) {
                        theme.assets.settingsIconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "settingsIcon",
                            ThemeAssetsEntity.SETTINGS_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets?.powerIcon) {
                        theme.assets.powerIconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "powerIcon",
                            ThemeAssetsEntity.POWER_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets?.backgroundImage) {
                        await theme.assets.setImage((await submittedTheme.assets.backgroundImage).createReadStream);
                    }

                    // Options
                    if ((submittedTheme.assets?.customLayoutJson || submittedTheme.assets?.customCommonLayoutJson) && submittedTheme.options?.length > 0) {
                        // themes don't support options for custom layouts
                        throw new InvalidThemeContentsError({}, "cannot combine layout options with a custom layout");
                    }
                    const options = submittedTheme.options.map(async (o) => {
                        const option = new ThemeOptionEntity();
                        option.layoutOptionValueUUID = o.uuid;
                        // determine which type the layoutOption expects, verify
                        const layoutOption = await this.layoutOptionService.findOption({valueUuid: o.uuid});
                        const type = layoutOption.type;
                        if (type === LayoutOptionType.INTEGER) {
                            if (!o.integerValue) throw new InvalidThemeContentsError({},
                                `missing option integerValue for ${o.uuid}`);
                            option.variable = o.integerValue.toString();
                        } else if (type === LayoutOptionType.DECIMAL) {
                            if (!o.decimalValue) throw new InvalidThemeContentsError({},
                                `missing option decimalValue for ${o.uuid}`);
                            option.variable = o.decimalValue.toPrecision(8).toString();
                        } else if (type === LayoutOptionType.STRING) {
                            if (!o.stringValue) throw new InvalidThemeContentsError({},
                                `missing option stringValue for ${o.uuid}`);
                            option.variable = o.stringValue;
                        } else if (type === LayoutOptionType.COLOR) {
                            if (!o.colorValue) throw new InvalidThemeContentsError({},
                                `missing option colorValue for ${o.uuid}`);
                            option.variable = o.colorValue;
                        }

                        return option;
                    });
                    theme.options = await Promise.all(options);

                    for (const tag of theme.tags) {
                        if (!insertedTags.map((t: ThemeTagEntity) => t.name).includes(tag.name)) {
                            insertedTags.push(tag);
                        }
                    }

                    insertedThemes.push(theme);
                }

                // HBThemes ------------------------------------------------------------------
                for (const submittedTheme of hbthemeData) {
                    const hbtheme = HBThemeEntity.create({
                        name: submittedTheme.name,
                        description: submittedTheme.description,
                        isNSFW: submittedTheme.isNSFW,
                        creator: creator,
                        tags: ThemeService.selectTags(submittedTheme.tags, insertedHbTags),
                        previews: new HBThemePreviewsEntity(),
                        assets: new HBThemeAssetsEntity(),
                        lightTheme: new HBThemeLightColorSchemeEntity(submittedTheme.lightTheme),
                        darkTheme: new HBThemeDarkColorSchemeEntity(submittedTheme.darkTheme),
                    });

                    // previews
                    await hbtheme.previews.generateFromStream((await submittedTheme.screenshot).createReadStream);

                    // assets
                    if (!Object.values(submittedTheme.assets).some((v) => !!v)) {
                        // theme require at least one asset
                        throw new InvalidThemeContentsError({}, "hbthemes require at least one asset");
                    }
                    hbtheme.assets.layout = submittedTheme.assets.layout;

                    if (submittedTheme.assets.icon) {
                        hbtheme.assets.iconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "icon",
                            HBThemeAssetsEntity.ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets.batteryIcon) {
                        hbtheme.assets.batteryIconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "batteryIcon",
                            HBThemeAssetsEntity.BATTERY_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets.chargingIcon) {
                        hbtheme.assets.chargingIconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "chargingIcon",
                            HBThemeAssetsEntity.CHARGING_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets.folderIcon) {
                        hbtheme.assets.folderIconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "folderIcon",
                            HBThemeAssetsEntity.FOLDER_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets.invalidIcon) {
                        hbtheme.assets.invalidIconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "invalidIcon",
                            HBThemeAssetsEntity.INVALID_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets.themeIconDark) {
                        hbtheme.assets.themeIconDarkFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "themeIconDark",
                            HBThemeAssetsEntity.THEME_ICON_DARK_FILE,
                        );
                    }
                    if (submittedTheme.assets.themeIconLight) {
                        hbtheme.assets.themeIconLightFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "themeIconLight",
                            HBThemeAssetsEntity.THEME_ICON_LIGHT_FILE,
                        );
                    }
                    if (submittedTheme.assets.airplaneIcon) {
                        hbtheme.assets.airplaneIconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "airplaneIcon",
                            HBThemeAssetsEntity.AIRPLANE_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets.wifiNoneIcon) {
                        hbtheme.assets.wifiNoneIconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "wifiNoneIcon",
                            HBThemeAssetsEntity.WIFI_NONE_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets.wifi1Icon) {
                        hbtheme.assets.wifi1IconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "wifi1Icon",
                            HBThemeAssetsEntity.WIFI1_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets.wifi2Icon) {
                        hbtheme.assets.wifi2IconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "wifi2Icon",
                            HBThemeAssetsEntity.WIFI2_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets.wifi3Icon) {
                        hbtheme.assets.wifi3IconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "wifi3Icon",
                            HBThemeAssetsEntity.WIFI3_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets.ethIcon) {
                        hbtheme.assets.ethIconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "ethIcon",
                            HBThemeAssetsEntity.ETH_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets.ethNoneIcon) {
                        hbtheme.assets.ethNoneIconFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "ethNoneIcon",
                            HBThemeAssetsEntity.ETH_NONE_ICON_FILE,
                        );
                    }
                    if (submittedTheme.assets.backgroundImage) {
                        hbtheme.assets.backgroundImageFile = await ThemeService.readIcon(
                            submittedTheme.assets,
                            "backgroundImage",
                            HBThemeAssetsEntity.BACKGROUND_IMAGE_FILE,
                        );
                    }

                    for (const tag of hbtheme.tags) {
                        if (!insertedHbTags.map((t: ThemeTagEntity) => t.name).includes(tag.name)) {
                            insertedHbTags.push(tag);
                        }
                    }

                    insertedHbthemes.push(hbtheme);
                }

                console.log(insertedThemes, insertedHbthemes, insertedTags);

                // Save all items ---------------------------------------------------------
                if (insertedPack) {
                    if (packData.preview) {
                        await insertedPack.previews.generateFromStream((await packData.preview).createReadStream);
                    } else {
                        // generate collage (design 2)
                        const orderedThemes = []
                            .concat(insertedThemes
                                .sort((a, b) => compareTargetFn(a.target, b.target)))
                            .concat(insertedHbthemes);

                        const firstBackground = orderedThemes.find((theme: ThemeEntity | HBThemeEntity) => !!theme.assets?.backgroundImageFile)?.assets.backgroundImageFile;
                        const themePreviews = orderedThemes.map((theme: ThemeEntity | HBThemeEntity) => theme.previews.image720File);
                        await insertedPack.previews.generateFromThemes(firstBackground, themePreviews);
                    }
                    insertedPack = await insertedPack.save();
                    // set as pack on all themes
                    for (const theme of insertedThemes) {
                        theme.pack = insertedPack;
                    }
                    for (const hbtheme of insertedHbthemes) {
                        hbtheme.pack = insertedPack;
                    }
                }

                await entityManager
                    .createQueryBuilder()
                    .insert()
                    .into(ThemeTagEntity)
                    .values(insertedTags)
                    .orUpdate(["name"], ["name"])
                    .execute();

                // because of a bug in typeorm tags are only saved in the first relation, not in all
                await entityManager
                    .createQueryBuilder()
                    .insert()
                    .into(ThemeTagEntity)
                    .values(insertedHbTags)
                    .orUpdate(["name"], ["name"])
                    .execute();

                await entityManager.save(ThemeEntity, insertedThemes);
                await entityManager.save(HBThemeEntity, insertedHbthemes);
            });

            // send webhook message
            if (insertedPack) {
                // pack submission
                await this.webhookService.newPack(insertedPack, insertedThemes, insertedHbthemes);
            } else {
                // theme submission
                await this.webhookService.newThemes(insertedThemes, insertedHbthemes);
            }
        } catch (e) {
            if ((e.detail as string)?.includes("layoutId")) {
                throw new LayoutNotFoundError({}, "Referenced layout does not exist");
            } else throw e;
        }
    }

    private static async readIcon(assets, fileName: keyof ThemeAssetsDataInput | keyof HBThemeAssetsDataInput, {
        width: requiredWidth,
        height: requiredHeight,
    }) {
        const buffer = await streamToBuffer((await assets[fileName]).createReadStream());
        const image = sharp(buffer);
        const {width, height} = await image.metadata();
        if (width !== requiredWidth || height !== requiredHeight)
            throw new InvalidIconAssetError({
                propertyName: propertyToTitleCase(fileName),
                requiredWidth,
                requiredHeight,
            });
        return buffer;
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
        return hashEntity.hashString;
    }

}