import {Controller, Get, Header, NotFoundException, Param, Redirect, Res} from "@nestjs/common";
import {Response} from "express";
import {ClientIP} from "../../common/decorators/ClientIP.decorator";
import {CurrentUser} from "../../../graphql/common/decorators/CurrentUser.gql.decorator";
import {UserEntity} from "../../../graphql/User/User.entity";
import {UserAgent} from "../../common/decorators/UserAgent.decorator";
import {PackService} from "../../../graphql/Pack/Pack.service";
import {PackCacheService} from "../../../graphql/Cache/Pack/PackCache.service";
import {PackDownloadService} from "../../../graphql/Pack/Download/PackDownload.service";

@Controller()
export class PacksDownloadRestController {

    constructor(private packService: PackService, private packDownloadService: PackDownloadService, private packCacheService: PackCacheService) {
    }

    private async exists(id: string) {
        const entity = await this.packService.findOne({id}, []);
        if (!entity) {
            throw new NotFoundException();
        }
    }

    @Get()
    @Redirect()
    async getDownload(@Param("id") id: string, @ClientIP() ip: string, @CurrentUser() user: UserEntity, @UserAgent() userAgent: string) {
        await this.exists(id);

        await this.packDownloadService.increment(id, ip, userAgent, user ? user.id : undefined);

        return {url: "download/pack.zip"};
    }

    @Get("pack.zip")
    @Header("Content-type", "application/zip")
    async getDownloadFile(@Param("id") id: string, @Res() res: Response){
        await this.exists(id);

        const {data, fileName} = await this.packCacheService.getFile(id);

        res.attachment(fileName)
        res.end(data, 'binary')
    }

}
