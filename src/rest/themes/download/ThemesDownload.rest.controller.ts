import {Controller, Get, Header, NotFoundException, Param, Redirect, Res} from "@nestjs/common";
import {Response} from "express";
import {ThemeService} from "../../../graphql/Theme/Theme.service";
import {ClientIP} from "../../common/decorators/ClientIP.decorator";
import {UserEntity} from "../../../graphql/User/User.entity";
import {UserAgent} from "../../common/decorators/UserAgent.decorator";
import {ThemeDownloadService} from "../../../graphql/Theme/Download/ThemeDownload.service";
import {ThemeCacheService} from "../../../graphql/Cache/Theme/ThemeCache.service";
import {ThemeEntity} from "../../../graphql/Theme/Theme.entity";
import {CurrentUser} from "../../../graphql/Auth/decorators/CurrentUser.decorator";

@Controller()
export class ThemesDownloadRestController {

    constructor(private themeService: ThemeService, private themeDownloadService: ThemeDownloadService, private themeCacheService: ThemeCacheService) {
    }

    private async getHash(id: string): Promise<ThemeEntity> {
        const hash = await this.themeService.getHash(id);
        if (!hash) {
            throw new NotFoundException();
        }
        return hash;
    }

    @Get()
    @Redirect()
    async getDownload(@Param("id") id: string, @ClientIP() ip: string, @CurrentUser() user: UserEntity, @UserAgent() userAgent: string) {
        const hash = await this.getHash(id);

        await this.themeDownloadService.increment(id, ip, userAgent, user ? user.id : undefined);

        return {url: "download/theme.nxtheme?hash=" + hash};
    }

    @Get("theme.nxtheme")
    @Header("Content-type", "application/nxtheme")
    async getDownloadFile(@Param("id") id: string, @Res() res: Response) {
        await this.getHash(id);

        const {data, fileName} = await this.themeCacheService.getFile(id);

        res.attachment(fileName);
        res.end(data, "binary");
    }

}
