import {Injectable} from "@nestjs/common";
import {ThemeService} from "../../Theme/Theme.service";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {ThemeCacheEntity} from "./ThemeCache.entity";
import {SarcFile} from "@themezernx/sarclib/dist";
import {Target} from "../../common/enums/Target";
import {toNice, toTheme} from "@themezernx/target-parser/dist";
import {invalidFilenameCharsREGEX} from "../../common/Constants";

@Injectable()
export class ThemeCacheService {

    constructor(@InjectRepository(ThemeCacheEntity) private cacheRepository: Repository<ThemeCacheEntity>, private themeService: ThemeService) {
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
        const theme = await this.themeService.findOne({id: themeId}, ["creator"]);
        const existingCache = await this.cacheRepository.findOne({where: {themeId}});

        let data: Buffer;
        let fileName: string;
        if (existingCache) {
            data = existingCache.file;
            fileName = existingCache.fileName;
        } else {
            const sarc = new SarcFile();

            const assets = theme.assets;
            let layoutInfo: string = "";
            if (theme.layout) {
                sarc.addRawFile(Buffer.from(theme.layout.json), "layout.json");
                layoutInfo = `${theme.layout.name} by ${theme.layout.creator.username}`;
                if (theme.layout.commonJson) {
                    sarc.addRawFile(Buffer.from(theme.layout.json), "common.json");
                }
            } else {
                if (assets.customLayoutJson) {
                    const parsed = JSON.parse(assets.customLayoutJson);
                    layoutInfo = `${parsed.PatchName} by ${parsed.AuthorName}`;
                    sarc.addRawFile(Buffer.from(assets.customLayoutJson), "layout.json");
                }
                if (assets.customCommonLayoutJson) {
                    sarc.addRawFile(Buffer.from(assets.customCommonLayoutJson), "common.json");
                }
            }
            if (assets.imageFile) {
                sarc.addRawFile(assets.imageFile, "image.jpg");
            }
            if (assets.albumIconFile) {
                sarc.addRawFile(assets.imageFile, "album.png");
            }
            if (assets.newsIconFile) {
                sarc.addRawFile(assets.imageFile, "news.png");
            }
            if (assets.shopIconFile) {
                sarc.addRawFile(assets.imageFile, "shop.png");
            }
            if (assets.controllerIconFile) {
                sarc.addRawFile(assets.imageFile, "controller.png");
            }
            if (assets.settingsIconFile) {
                sarc.addRawFile(assets.imageFile, "settings.png");
            }
            if (assets.powerIconFile) {
                sarc.addRawFile(assets.imageFile, "power.png");
            }
            if (assets.homeIconFile) {
                sarc.addRawFile(assets.imageFile, "lock.png");
            }
            // create info.json
            const info = {
                Version: 15,
                ThemeName: theme.name,
                Author: theme.creator.username,
                Target: toTheme(theme.target),
                LayoutInfo: layoutInfo || "",
            };
            sarc.addRawFile(Buffer.from(JSON.stringify(info, null, 4)), "info.json");

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