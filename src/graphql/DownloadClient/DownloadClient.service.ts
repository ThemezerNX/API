import {Injectable} from "@nestjs/common";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {DownloadClientEntity} from "./DownloadClient.entity";

@Injectable()
export class DownloadClientService {

    constructor(@InjectRepository(DownloadClientEntity) private repository: Repository<DownloadClientEntity>) {
    }

    async findOrInsert(userAgent: string) {
        const entry = await this.repository.findOne({
            where: {userAgent},
        });

        if (entry) {
            return entry;
        } else {
            return await this.repository.create({userAgent}).save();
        }
    }

}