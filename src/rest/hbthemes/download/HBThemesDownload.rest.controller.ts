import {Controller, Get, Header, NotFoundException, Param, Redirect, Res} from "@nestjs/common";
import {Response} from "express";
import {ClientIP} from "../../common/decorators/ClientIP.decorator";
import {UserEntity} from "../../../graphql/User/User.entity";
import {UserAgent} from "../../common/decorators/UserAgent.decorator";
import {HBThemeService} from "../../../graphql/HBTheme/HBTheme.service";
import {HBThemeDownloadService} from "../../../graphql/HBTheme/Download/HBThemeDownload.service";
import {HBThemeCacheService} from "../../../graphql/Cache/HBTheme/HBThemeCache.service";
import {CurrentUser} from "../../../graphql/Auth/decorators/CurrentUser.decorator";

@Controller()
export class HBThemesDownloadRestController {

    constructor(private hbthemeService: HBThemeService, private hbthemeDownloadService: HBThemeDownloadService, private hbthemeCacheService: HBThemeCacheService) {
    }

    private async getHash(id: string): Promise<string> {
        const hash = await this.hbthemeService.getHash(id);
        if (!hash) {
            throw new NotFoundException();
        }
        return hash;
    }

    @Get()
    @Redirect()
    async getDownload(@Param("id") id: string, @ClientIP() ip: string, @CurrentUser() user: UserEntity, @UserAgent() userAgent: string) {
        const hash = await this.getHash(id);

        await this.hbthemeDownloadService.increment(id, ip, userAgent, user ? user.id : undefined);

        return {url: "download/theme.romfs?hash=" + hash};
    }

    @Get("theme.romfs")
    @Header("Content-type", "application/romfs")
    async getDownloadFile(@Param("id") id: string, @Res() res: Response) {
        await this.getHash(id);

        const {data, fileName} = await this.hbthemeCacheService.getFile(id);

        res.attachment(fileName);
        res.end(data, "binary");
    }

}
