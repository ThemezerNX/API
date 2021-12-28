import {Injectable} from "@nestjs/common";
import {FindConditions, Raw, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {ThemeDownloadEntity} from "./ThemeDownload.entity";
import {DownloadClientService} from "../../DownloadClient/DownloadClient.service";

@Injectable()
export class ThemeDownloadService {

    constructor(@InjectRepository(ThemeDownloadEntity) private repository: Repository<ThemeDownloadEntity>, private downloadClientService: DownloadClientService) {
    }

    async increment(id: string, ip: string, userAgent: string, userId?: string) {
        const findConditions: FindConditions<ThemeDownloadEntity> = {};

        // Try to find an entry made within the last hour
        if (userId != undefined) {
            findConditions.user = {
                id: userId,
            };
        }
        findConditions.themeId = id;
        findConditions.ip = ip;
        findConditions.timestamp = Raw((alias) => `${alias} > (NOW() - '1 hour'::INTERVAL)`);

        const entry = await this.repository.findOne({
            where: findConditions,
        });

        // If there was none, register as a new download
        if (!entry) {
            const entry = new ThemeDownloadEntity();
            entry.themeId = id;
            entry.ip = ip;
            if (userId != undefined) {
                entry.userId = userId;
            }
            entry.downloadClient = await this.downloadClientService.findOrInsert(userAgent);

            await entry.save();
        }
    }

}