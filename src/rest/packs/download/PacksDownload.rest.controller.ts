import {Controller, Get, Header, NotFoundException, Param, Redirect, Res} from "@nestjs/common";
import {Response} from "express";
import {UserEntity} from "../../../graphql/User/User.entity";
import {PackService} from "../../../graphql/Pack/Pack.service";
import {PackCacheService} from "../../../graphql/Cache/Pack/PackCache.service";
import {PackDownloadService} from "../../../graphql/Pack/Download/PackDownload.service";
import {ClientIP} from "../../../common/decorators/ClientIP.decorator";
import {CurrentUser} from "../../../common/decorators/CurrentUser.decorator";
import {UserAgent} from "../../../common/decorators/UserAgent.decorator";

@Controller()
export class PacksDownloadRestController {

    constructor(private packService: PackService, private packDownloadService: PackDownloadService, private packCacheService: PackCacheService) {
    }

    private async getHash(id: string): Promise<string> {
        const hash = await this.packService.getHash(id);
        if (!hash) {
            throw new NotFoundException();
        }
        return hash;
    }

    @Get()
    @Redirect()
    async getDownload(@Param("id") id: string, @ClientIP() ip: string, @CurrentUser() user: UserEntity, @UserAgent() userAgent: string) {
        const hash = await this.getHash(id);

        await this.packDownloadService.increment(id, ip, userAgent, user ? user.id : undefined);

        return {url: "download/pack.zip?hash=" + hash};
    }

    @Get("pack.zip")
    @Header("Content-type", "application/zip")
    async getDownloadFile(@Param("id") id: string, @Res() res: Response) {
        await this.getHash(id);

        const {data, fileName} = await this.packCacheService.getFile(id);

        res.attachment(fileName);
        res.end(data, "binary");
        res.end(null);
    }

}
