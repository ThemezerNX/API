import {Injectable} from "@nestjs/common";
import {ThemeService} from "../../Theme/Theme.service";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {ThemeCacheEntity} from "./ThemeCache.entity";
import {SarcFile} from "@themezernx/sarclib/dist";
import {Target} from "../../common/enums/Target";
import {toNice, toTheme} from "@themezernx/target-parser/dist";
import {invalidFilenameCharsREGEX} from "../../common/Constants";
import {ThemeAssetsEntity} from "../../Theme/Assets/ThemeAssets.entity";
import {LayoutService} from "../../Layout/Layout.service";

@Injectable()
export class ThemeCacheService {

    constructor(
        @InjectRepository(ThemeCacheEntity) private cacheRepository: Repository<ThemeCacheEntity>,
        private themeService: ThemeService,
        private layoutService: LayoutService,
    ) {
    }

    private static getName(themeName: string, authorName: string, target: Target, themeId: string, layoutInfo?: string) {
        let name = `${themeName} by ${authorName} (${toNice(target)})`;
        if (layoutInfo) {
            name += `; ${layoutInfo}`;
        }
        name += `-${themeId}.nxtheme`;
        name = name.replace(invalidFilenameCharsREGEX, "_");

        return name;
    }

    async getFile(themeId: string): Promise<{ data: Buffer, fileName: string }> {
        const theme = await this.themeService.findOne({id: themeId}, {
            relations: {
                creator: true,
                options: {
                    layoutOptionValue: {
                        layoutOption: true,
                    },
                },
            },
        });
        const existingCache = await this.cacheRepository.findOne({where: {themeId}});

        let data: Buffer;
        let fileName: string;
        if (existingCache) {
            data = existingCache.file;
            fileName = existingCache.fileName;
        } else {
            const sarc = new SarcFile();

            const assets = theme.assets;
            let layoutInfo = "";
            if (theme.layout) {
                const builtLayout = await this.layoutService.buildOneForTheme(theme.layout, theme.options);
                sarc.addRawFile(builtLayout, ThemeAssetsEntity.LAYOUT_FILENAME);
                layoutInfo = `${theme.layout.name} by ${theme.layout.creator.username}`;
                if (theme.layout.commonJson) {
                    sarc.addRawFile(Buffer.from(theme.layout.json), ThemeAssetsEntity.COMMON_FILENAME);
                }
            } else {
                if (assets?.customLayoutJson) {
                    const parsed = JSON.parse(assets.customLayoutJson);
                    layoutInfo = `${parsed.PatchName} by ${parsed.AuthorName}`;
                    sarc.addRawFile(Buffer.from(assets.customLayoutJson), ThemeAssetsEntity.LAYOUT_FILENAME);
                }
                if (assets?.customCommonLayoutJson) {
                    sarc.addRawFile(Buffer.from(assets.customCommonLayoutJson), ThemeAssetsEntity.COMMON_FILENAME);
                }
            }
            if (assets?.backgroundImageFile) {
                sarc.addRawFile(assets.backgroundImageFile, ThemeAssetsEntity.BACKGROUND_IMAGE_FILE.name);
            }
            if (assets?.albumIconFile) {
                sarc.addRawFile(assets.albumIconFile, ThemeAssetsEntity.ALBUM_ICON_FILE.name);
            }
            if (assets?.newsIconFile) {
                sarc.addRawFile(assets.newsIconFile, ThemeAssetsEntity.NEWS_ICON_FILE.name);
            }
            if (assets?.shopIconFile) {
                sarc.addRawFile(assets.shopIconFile, ThemeAssetsEntity.SHOP_ICON_FILE.name);
            }
            if (assets?.controllerIconFile) {
                sarc.addRawFile(assets.controllerIconFile, ThemeAssetsEntity.CONTROLLER_ICON_FILE.name);
            }
            if (assets?.settingsIconFile) {
                sarc.addRawFile(assets.settingsIconFile, ThemeAssetsEntity.SETTINGS_ICON_FILE.name);
            }
            if (assets?.powerIconFile) {
                sarc.addRawFile(assets.powerIconFile, ThemeAssetsEntity.POWER_ICON_FILE.name);
            }
            if (assets?.homeIconFile) {
                sarc.addRawFile(assets.homeIconFile, ThemeAssetsEntity.HOME_ICON_FILE.name);
            }
            // create info.json
            const info = {
                Version: 15,
                ThemeName: theme.name,
                Author: theme.creator.username,
                Target: toTheme(theme.target),
                LayoutInfo: layoutInfo || "",
            };
            sarc.addRawFile(Buffer.from(JSON.stringify(info, null, 4)), ThemeAssetsEntity.INFO_FILENAME);

            data = sarc.save(2);
            fileName = ThemeCacheService.getName(theme.name,
                theme.creator.username,
                theme.target,
                theme.id,
                layoutInfo);
            await this.cacheRepository.create({themeId, file: data, fileName}).save();
        }

        return {data, fileName};
    }

}