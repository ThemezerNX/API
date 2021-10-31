import {Controller, Get, Header, NotFoundException, Param, Redirect, Res} from "@nestjs/common";
import {Response} from "express";
import {ClientIP} from "../../common/decorators/ClientIP.decorator";
import {UserEntity} from "../../../graphql/User/User.entity";
import {UserAgent} from "../../common/decorators/UserAgent.decorator";
import {HBThemeService} from "../../../graphql/HBTheme/HBTheme.service";
import {HBThemeDownloadService} from "../../../graphql/HBTheme/Download/HBThemeDownload.service";
import {HBThemeCacheService} from "../../../graphql/Cache/HBTheme/HBThemeCache.service";
import {HBThemeEntity} from "../../../graphql/HBTheme/HBTheme.entity";
import {CurrentUser} from "../../../graphql/Auth/decorators/CurrentUser.decorator";

@Controller()
export class HBThemesDownloadRestController {

    constructor(private hbthemeService: HBThemeService, private hbthemeDownloadService: HBThemeDownloadService, private hbthemeCacheService: HBThemeCacheService) {
    }

    private async exists(id: string): Promise<HBThemeEntity> {
        const entity = await this.hbthemeService.findOne({id}, {relations: ["creator"]});
        if (!entity) {
            throw new NotFoundException();
        }
        return entity;
    }

    @Get()
    @Redirect()
    async getDownload(@Param("id") id: string, @ClientIP() ip: string, @CurrentUser() user: UserEntity, @UserAgent() userAgent: string) {
        const item = await this.exists(id);

        await this.hbthemeDownloadService.increment(id, ip, userAgent, user ? user.id : undefined);

        return {url: "download/theme.romfs?cache=" + item.cacheId + item.assets.cacheId + item.creator.cacheId};
    }

    @Get("theme.romfs")
    @Header("Content-type", "application/romfs")
    async getDownloadFile(@Param("id") id: string, @Res() res: Response) {
        await this.exists(id);

        const {data, fileName} = await this.hbthemeCacheService.getFile(id);

        res.attachment(fileName);
        res.end(data, "binary");
    }

}
