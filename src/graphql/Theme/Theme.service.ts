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
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository);
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
            .orderBy({[queryBuilder.alias + `."${sort}"`]: order});

        if (query?.length > 0) {
            queryBuilder.andWhere(`to_tsquery(:query) @@ (
                setweight(to_tsvector('pg_catalog.english', coalesce("${queryBuilder.alias}".name, '')), 'A') ||
                setweight(to_tsvector('pg_catalog.english', coalesce("${queryBuilder.alias}".description, '')), 'C') ||
                to_tsvector('pg_catalog.english', coalesce(CASE WHEN "${queryBuilder.alias}"."isNSFW" THEN 'NSFW' END, '')) ||
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

    async insertMultiple(creator: UserEntity, themeData: ThemeData[], packData: PackData) {
        try {
            let insertedPack: PackEntity = null;
            const insertedThemes: ThemeEntity[] = [];
            const insertedHbthemes: HBThemeEntity[] = [];
            await getConnection().manager.transaction(async entityManager => {
                if (packData) {
                    insertedPack = PackEntity.create({
                        creator: creator,
                        name: packData.name,
                        description: packData.description,
                        previews: new PackPreviewsEntity(),
                        isNSFW: themeData.some(theme => theme.isNSFW),
                    });
                }
                const insertTags = [];
                for (const submittedTheme of themeData) {
                    const theme = ThemeEntity.create({
                        name: submittedTheme.name,
                        description: submittedTheme.description,
                        target: submittedTheme.target,
                        isNSFW: submittedTheme.isNSFW,
                        creator: creator,
                        layoutId: submittedTheme.layoutId || null,
                        tags: submittedTheme.tags.map((tag) => new ThemeTagEntity(titleCase(tag))),
                        previews: new ThemePreviewsEntity(),
                        assets: new ThemeAssetsEntity(),
                    });

                    // previews
                    await theme.previews.generateFromStream((await submittedTheme.screenshot).createReadStream);

                    // assets
                    if (!(submittedTheme.assets?.image || submittedTheme.layoutId || submittedTheme.assets?.customLayoutJson || submittedTheme.assets?.customCommonLayoutJson)) {
                        // theme require at least either image or layout
                        throw new InvalidThemeContentsError("themes require an image, a layout, or both");
                    }
                    if (!!submittedTheme.layoutId && !!(submittedTheme.assets?.customLayoutJson || submittedTheme.assets?.customCommonLayoutJson)) {
                        // can't have custom layout AND layoutId
                        throw new InvalidThemeContentsError(
                            "layoutId cannot be combined with customLayoutJson or customCommonLayoutJson",
                        );
                    } else {
                        theme.assets.customLayoutJson = submittedTheme.assets?.customLayoutJson;
                        theme.assets.customCommonLayoutJson = submittedTheme.assets?.customCommonLayoutJson;
                    }

                    if (submittedTheme.assets?.homeIcon)
                        theme.assets.homeIconFile = await ThemeService.readIcon(submittedTheme.assets, "homeIcon");
                    if (submittedTheme.assets?.albumIcon)
                        theme.assets.albumIconFile = await ThemeService.readIcon(submittedTheme.assets, "albumIcon");
                    if (submittedTheme.assets?.newsIcon)
                        theme.assets.newsIconFile = await ThemeService.readIcon(submittedTheme.assets, "newsIcon");
                    if (submittedTheme.assets?.shopIcon)
                        theme.assets.shopIconFile = await ThemeService.readIcon(submittedTheme.assets, "shopIcon");
                    if (submittedTheme.assets?.controllerIcon)
                        theme.assets.controllerIconFile = await ThemeService.readIcon(submittedTheme.assets,
                            "controllerIcon");
                    if (submittedTheme.assets?.settingsIcon)
                        theme.assets.settingsIconFile = await ThemeService.readIcon(submittedTheme.assets,
                            "settingsIcon");
                    if (submittedTheme.assets?.powerIcon)
                        theme.assets.powerIconFile = await ThemeService.readIcon(submittedTheme.assets, "powerIcon");
                    if (submittedTheme.assets?.image) {
                        await theme.assets.setImage((await submittedTheme.assets.image).createReadStream);
                    }

                    // Options
                    if ((submittedTheme.assets?.customLayoutJson || submittedTheme.assets?.customCommonLayoutJson) && submittedTheme.options?.length > 0) {
                        // themes don't support options for custom layouts
                        throw new InvalidThemeContentsError("cannot combine layout options with a custom layout");
                    }
                    const options = submittedTheme.options.map(async (o) => {
                        const option = new ThemeOptionEntity();
                        option.layoutOptionValueUUID = o.uuid;
                        // determine which type the layoutOption expects, verify
                        const layoutOption = await this.layoutOptionService.findOption({valueUuid: o.uuid});
                        const type = layoutOption.type;
                        if (type === LayoutOptionType.INTEGER) {
                            if (!o.integerValue) throw new InvalidThemeContentsError(`missing option integerValue for ${o.uuid}`);
                            option.variable = o.integerValue.toString();
                        } else if (type === LayoutOptionType.DECIMAL) {
                            if (!o.decimalValue) throw new InvalidThemeContentsError(`missing option decimalValue for ${o.uuid}`);
                            option.variable = o.decimalValue.toPrecision(8).toString();
                        } else if (type === LayoutOptionType.STRING) {
                            if (!o.stringValue) throw new InvalidThemeContentsError(`missing option stringValue for ${o.uuid}`);
                            option.variable = o.stringValue;
                        } else if (type === LayoutOptionType.COLOR) {
                            if (!o.colorValue) throw new InvalidThemeContentsError(`missing option colorValue for ${o.uuid}`);
                            option.variable = o.colorValue;
                        }

                        return option;
                    });
                    theme.options = await Promise.all(options);

                    for (const tag of theme.tags) {
                        if (!insertTags.map((t: ThemeTagEntity) => t.name).includes(tag.name)) {
                            insertTags.push(tag);
                        }
                    }
                    insertedThemes.push(theme);
                }

                if (insertedPack) {
                    if (packData.preview) {
                        await insertedPack.previews.generateFromStream((await packData.preview).createReadStream);
                    } else {
                        // generate collage (design 2)
                        const orderedThemes = insertedThemes.sort((a, b) => compareTargetFn(a.target, b.target));
                        const firstBackground = orderedThemes.find((theme: ThemeEntity) => !!theme.assets?.imageFile)?.assets.imageFile;
                        const themePreviews = orderedThemes.map((theme: ThemeEntity) => theme.previews.image720File);
                        await insertedPack.previews.generateFromThemes(firstBackground, themePreviews);
                    }
                    insertedPack = await insertedPack.save();
                    // set as pack on all themes
                    for (const theme of insertedThemes) {
                        theme.pack = insertedPack;
                    }
                }

                await entityManager
                    .createQueryBuilder()
                    .insert()
                    .into(ThemeTagEntity)
                    .values(insertTags)
                    .orUpdate(["name"], ["name"])
                    .execute();

                await entityManager.save(ThemeEntity, insertedThemes);
                console.log(insertedThemes);
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

    async isOwner(themeId: string, userId: string): Promise<boolean> {
        return !!(await exists(
            this.repository.createQueryBuilder()
                .where({id: themeId, creatorId: userId}),
        ));
    }

    async getHash(themeId: string): Promise<string> {
        const hashEntity = await this.hashRepository.createQueryBuilder()
            .where({themeId})
            .getOne();
        return hashEntity.hashString;
    }

}