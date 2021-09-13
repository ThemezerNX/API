import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {HBThemeCacheEntity} from "./HBThemeCache.entity";
import {Target} from "../../common/enums/Target";
import {toNice} from "@themezernx/target-parser/dist";
import {invalidFilenameCharsREGEX} from "../../common/Constants";
import {HBThemeService} from "../../HBTheme/HBTheme.service";

@Injectable()
export class HBThemeCacheService {

    constructor(@InjectRepository(HBThemeCacheEntity) private cacheRepository: Repository<HBThemeCacheEntity>, private themeService: HBThemeService) {
    }

    private static getName(themeName: string, authorName: string, target: Target, themeId: string, layoutInfo?: string) {
        let name = `${themeName} by ${authorName} (${toNice(target)})`;
        if (layoutInfo) {
            name += `; ${layoutInfo}`;
        }
        name += `-${themeId}.romfs`;
        name = name.replace(invalidFilenameCharsREGEX, "_");

        return name;
    }

    async getFile(hbthemeId: string): Promise<{ data: Buffer, fileName: string }> {
        const theme = await this.themeService.findOne({id: hbthemeId}, ["creator"]);
        const existingCache = await this.cacheRepository.findOne({where: {themeId: hbthemeId}});

        let data: Buffer;
        let fileName: string;
        if (existingCache) {
            data = existingCache.file;
            fileName = existingCache.fileName;
        } else {
            // run switch-tools and generate romfs file
        }

        return {data, fileName};
    }

}