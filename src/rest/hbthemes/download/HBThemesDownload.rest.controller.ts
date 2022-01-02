import {Controller, Get, Header, NotFoundException, Param, Redirect, Res} from "@nestjs/common";
import {Response} from "express";
import {UserEntity} from "../../../graphql/User/User.entity";
import {HBThemeService} from "../../../graphql/HBTheme/HBTheme.service";
import {HBThemeDownloadService} from "../../../graphql/HBTheme/Download/HBThemeDownload.service";
import {HBThemeCacheService} from "../../../graphql/Cache/HBTheme/HBThemeCache.service";
import {ClientIP} from "../../../common/decorators/ClientIP.decorator";
import {CurrentUser} from "../../../common/decorators/CurrentUser.decorator";
import {UserAgent} from "../../../common/decorators/UserAgent.decorator";
import {checkAccessPermissions} from "../../common/functions/checkAccessPermissions";

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
        checkAccessPermissions(await this.hbthemeService.findOne({id}), user);
        const hash = await this.getHash(id);

        await this.hbthemeDownloadService.increment(id, ip, userAgent, user ? user.id : undefined);

        return {url: "download/theme.zip?hash=" + hash};
    }

    @Get("theme.zip")
    @Header("Content-type", "application/zip")
    async getDownloadFile(@Param("id") id: string, @CurrentUser() user: UserEntity, @Res() res: Response) {
        checkAccessPermissions(await this.hbthemeService.findOne({id}), user);
        await this.getHash(id);

        const {data, fileName} = await this.hbthemeCacheService.getFile(id);

        res.attachment(fileName);
        res.end(data, "binary");
        res.end(null);
    }

}
