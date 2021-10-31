import {Controller, Get, Header, NotFoundException, Param, Redirect, Res} from "@nestjs/common";
import {Response} from "express";
import {ClientIP} from "../../common/decorators/ClientIP.decorator";
import {UserEntity} from "../../../graphql/User/User.entity";
import {UserAgent} from "../../common/decorators/UserAgent.decorator";
import {PackService} from "../../../graphql/Pack/Pack.service";
import {PackCacheService} from "../../../graphql/Cache/Pack/PackCache.service";
import {PackDownloadService} from "../../../graphql/Pack/Download/PackDownload.service";
import {PackEntity} from "../../../graphql/Pack/Pack.entity";
import {CurrentUser} from "../../../graphql/Auth/decorators/CurrentUser.decorator";

@Controller()
export class PacksDownloadRestController {

    constructor(private packService: PackService, private packDownloadService: PackDownloadService, private packCacheService: PackCacheService) {
    }

    private async exists(id: string): Promise<PackEntity> {
        const entity = await this.packService.findOne({id}, {relations: ["creator", "themes", "hbthemes", "themes.layout"]});
        if (!entity) {
            throw new NotFoundException();
        }
        return entity;
    }

    @Get()
    @Redirect()
    async getDownload(@Param("id") id: string, @ClientIP() ip: string, @CurrentUser() user: UserEntity, @UserAgent() userAgent: string) {
        const item = await this.exists(id);

        await this.packDownloadService.increment(id, ip, userAgent, user ? user.id : undefined);

        let themesCacheId = 0;
        if (item.themes) {
            for (const theme of item.themes) {
                themesCacheId += theme.cacheId + theme.assets.cacheId + (theme.layout ? theme.layout.cacheId : 0);
            }
        }
        if (item.hbthemes) {
            for (const hbtheme of item.hbthemes) {
                themesCacheId += hbtheme.cacheId + hbtheme.assets.cacheId;
            }
        }

        return {url: "download/pack.zip?cache=" + item.cacheId + item.creator.cacheId + themesCacheId};
    }

    @Get("pack.zip")
    @Header("Content-type", "application/zip")
    async getDownloadFile(@Param("id") id: string, @Res() res: Response) {
        await this.exists(id);

        const {data, fileName} = await this.packCacheService.getFile(id);

        res.attachment(fileName);
        res.end(data, "binary");
        res.end(null)
    }

}
