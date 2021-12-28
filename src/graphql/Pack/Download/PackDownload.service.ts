import {Injectable} from "@nestjs/common";
import {FindConditions, Raw, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {PackDownloadEntity} from "./PackDownload.entity";
import {DownloadClientService} from "../../DownloadClient/DownloadClient.service";

@Injectable()
export class PackDownloadService {

    constructor(@InjectRepository(PackDownloadEntity) private repository: Repository<PackDownloadEntity>, private downloadClientService: DownloadClientService) {
    }

    async increment(id: string, ip: string, userAgent: string, userId?: string) {
        const findConditions: FindConditions<PackDownloadEntity> = {};

        // Try to find an entry made within the last hour
        if (userId != undefined) {
            findConditions.user = {
                id: userId,
            };
        }
        findConditions.packId = id;
        findConditions.ip = ip;
        findConditions.timestamp = Raw((alias) => `${alias} > (NOW() - '1 hour'::INTERVAL)`);

        const entry = await this.repository.findOne({
            where: findConditions,
        });

        // If there was none, register as a new download
        if (!entry) {
            const entry = new PackDownloadEntity();
            entry.packId = id;
            entry.ip = ip;
            if (userId != undefined) {
                entry.userId = userId;
            }
            entry.downloadClient = await this.downloadClientService.findOrInsert(userAgent);

            await entry.save();
        }
    }

}