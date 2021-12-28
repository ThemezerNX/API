import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {HBThemeCacheEntity} from "./HBThemeCache.entity";
import {Target} from "../../common/enums/Target";
import {toNice} from "@themezernx/target-parser/dist";
import {invalidFilenameCharsREGEX} from "../../common/Constants";
import {HBThemeService} from "../../HBTheme/HBTheme.service";
import * as AdmZip from "adm-zip";
import {HBThemeCfg} from "./HBThemeCfg.service";
import {HBThemeAssetsEntity} from "../../HBTheme/Assets/HBThemeAssets.entity";

@Injectable()
export class HBThemeCacheService {

    constructor(
        @InjectRepository(HBThemeCacheEntity) private cacheRepository: Repository<HBThemeCacheEntity>,
        private hbthemeService: HBThemeService,
    ) {
    }

    private static getName(themeName: string, authorName: string, target: Target, themeId: string) {
        let name = `${themeName} by ${authorName} (${target ? toNice(target) : "Homebrew"})`;
        name += `-${themeId}.zip`;
        name = name.replace(invalidFilenameCharsREGEX, "_");

        return name;
    }

    async getFile(hbthemeId: string): Promise<{ data: Buffer, fileName: string }> {
        const hbtheme = await this.hbthemeService.findOne({id: hbthemeId}, {
            relations: {
                creator: true,
                assets: true,
                lightTheme: true,
                darkTheme: true,
            },
        });
        const existingCache = await this.cacheRepository.findOne({where: {hbthemeId}});

        let data: Buffer;
        let fileName: string;
        if (existingCache) {
            data = existingCache.file;
            fileName = existingCache.fileName;
        } else {
            const zip = new AdmZip();

            const assets = hbtheme.assets;

            const cfg = new HBThemeCfg(hbtheme);

            zip.addFile(HBThemeAssetsEntity.CFG_FILENAME, Buffer.from(cfg.toString()));

            if (assets.iconFile) {
                zip.addFile(HBThemeAssetsEntity.ICON_FILE.name, assets.iconFile);
            }
            if (assets.batteryIconFile) {
                zip.addFile(HBThemeAssetsEntity.BATTERY_ICON_FILE.name, assets.batteryIconFile);
            }
            if (assets.chargingIconFile) {
                zip.addFile(HBThemeAssetsEntity.CHARGING_ICON_FILE.name, assets.chargingIconFile);
            }
            if (assets.folderIconFile) {
                zip.addFile(HBThemeAssetsEntity.FOLDER_ICON_FILE.name, assets.folderIconFile);
            }
            if (assets.invalidIconFile) {
                zip.addFile(HBThemeAssetsEntity.INVALID_ICON_FILE.name, assets.invalidIconFile);
            }
            if (assets.themeIconDarkFile) {
                zip.addFile(HBThemeAssetsEntity.THEME_ICON_DARK_FILE.name, assets.themeIconDarkFile);
            }
            if (assets.themeIconLightFile) {
                zip.addFile(HBThemeAssetsEntity.THEME_ICON_LIGHT_FILE.name, assets.themeIconLightFile);
            }
            if (assets.airplaneIconFile) {
                zip.addFile(HBThemeAssetsEntity.AIRPLANE_ICON_FILE.name, assets.airplaneIconFile);
            }
            if (assets.wifiNoneIconFile) {
                zip.addFile(HBThemeAssetsEntity.WIFI_NONE_ICON_FILE.name, assets.wifiNoneIconFile);
            }
            if (assets.wifi1IconFile) {
                zip.addFile(HBThemeAssetsEntity.WIFI1_ICON_FILE.name, assets.wifi1IconFile);
            }
            if (assets.wifi2IconFile) {
                zip.addFile(HBThemeAssetsEntity.WIFI2_ICON_FILE.name, assets.wifi2IconFile);
            }
            if (assets.wifi3IconFile) {
                zip.addFile(HBThemeAssetsEntity.WIFI3_ICON_FILE.name, assets.wifi3IconFile);
            }
            if (assets.ethIconFile) {
                zip.addFile(HBThemeAssetsEntity.ETH_ICON_FILE.name, assets.ethIconFile);
            }
            if (assets.ethNoneIconFile) {
                zip.addFile(HBThemeAssetsEntity.ETH_NONE_ICON_FILE.name, assets.ethNoneIconFile);
            }
            if (assets.backgroundImageFile) {
                zip.addFile(HBThemeAssetsEntity.BACKGROUND_IMAGE_FILE.name, assets.backgroundImageFile);
            }

            data = zip.toBuffer();
            fileName = HBThemeCacheService.getName(hbtheme.name, hbtheme.creator.username, null, hbthemeId);
            await this.cacheRepository.create({hbthemeId, file: data, fileName}).save();

        }

        return {data, fileName};
    }

}