import {Injectable} from "@nestjs/common";
import {FindConditions, Raw, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {HBThemeDownloadEntity} from "./HBThemeDownload.entity";
import {DownloadClientService} from "../../DownloadClient/DownloadClient.service";

@Injectable()
export class HBThemeDownloadService {

    constructor(@InjectRepository(HBThemeDownloadEntity) private repository: Repository<HBThemeDownloadEntity>, private downloadClientService: DownloadClientService) {
    }

    async increment(id: string, ip: string, userAgent: string, userId?: string){
        const findConditions: FindConditions<HBThemeDownloadEntity> = {};

        // Try to find an entry made within the last hour
        if (userId != undefined) {
            findConditions.user = {
                id: userId,
            };
        }
        findConditions.hbthemeId = id;
        findConditions.ip = ip;
        findConditions.timestamp = Raw((alias) => `${alias} > (NOW() - '1 hour'::INTERVAL)`);

        const entry = await this.repository.findOne({
            where: findConditions,
        });

        // If there was none, register as a new download
        if (!entry) {
            const entry = new HBThemeDownloadEntity();
            entry.hbthemeId = id;
            entry.ip = ip;
            if (userId != undefined) {
                entry.userId = userId;
            }
            entry.downloadClient = await this.downloadClientService.findOrInsert(userAgent);

            await entry.save();
        }
    }

}