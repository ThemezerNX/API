import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {invalidFilenameCharsREGEX} from "../../common/Constants";
import {PackCacheEntity} from "./PackCache.entity";
import {PackService} from "../../Pack/Pack.service";
import * as AdmZip from "adm-zip";
import {ThemeCacheService} from "../Theme/ThemeCache.service";
import {HBThemeCacheService} from "../HBTheme/HBThemeCache.service";


@Injectable()
export class PackCacheService {

    constructor(@InjectRepository(PackCacheEntity) private cacheRepository: Repository<PackCacheEntity>, private packService: PackService, private themeCacheService: ThemeCacheService, private hbthemeCacheService: HBThemeCacheService) {
    }

    private static getName(packName: string, authorName: string, packId: string) {
        return `${packName} by ${authorName} via Themezer-${packId}.zip`.replace(invalidFilenameCharsREGEX, "_");
    }

    async getFile(packId: string): Promise<{ data: Buffer, fileName: string }> {
        const pack = await this.packService.findOne({id: packId}, ["creator", "themes", "hbthemes"]);
        const existingCache = await this.cacheRepository.findOne({where: {packId}});

        let data: Buffer;
        let fileName: string;
        if (existingCache) {
            data = existingCache.file;
            fileName = existingCache.fileName;
        } else {
            const zip = new AdmZip();
            if (pack.themes) {
                for (const theme of pack.themes) {
                    const {data, fileName} = await this.themeCacheService.getFile(theme.id);
                    zip.addFile(fileName, data);
                }
            }
            if (pack.hbthemes) {
                for (const hbtheme of pack.hbthemes) {
                    const {data, fileName} = await this.hbthemeCacheService.getFile(hbtheme.id);
                    zip.addFile(fileName, data);
                }
            }

            data = zip.toBuffer();
            fileName = PackCacheService.getName(pack.name, pack.creator.username, pack.id);
            await this.cacheRepository.create({packId, file: data, fileName}).save();
        }

        return {data, fileName};
    }

}