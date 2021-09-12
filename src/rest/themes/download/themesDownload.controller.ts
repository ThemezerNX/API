import {Controller, Get, Header, NotFoundException, Param, Redirect, Res} from "@nestjs/common";
import {Response} from "express";
import {ThemeService} from "../../../graphql/Theme/Theme.service";
import {ClientIP} from "../../common/decorators/ClientIP.decorator";
import {CurrentUser} from "../../../graphql/common/decorators/CurrentUser.gql.decorator";
import {UserEntity} from "../../../graphql/User/User.entity";
import {UserAgent} from "../../common/decorators/UserAgent.decorator";
import {ThemeDownloadService} from "../../../graphql/Theme/Download/ThemeDownload.service";
import {ThemeCacheService} from "../../../graphql/Cache/Theme/ThemeCache.service";

@Controller()
export class ThemesDownloadController {

    constructor(private themeService: ThemeService, private themeDownloadService: ThemeDownloadService, private themeCacheService: ThemeCacheService) {
    }

    private async exists(id: string) {
        const entity = await this.themeService.findOne({id}, []);
        if (!entity) {
            throw new NotFoundException();
        }
    }

    @Get()
    @Redirect()
    async getDownload(@Param("id") id: string, @ClientIP() ip: string, @CurrentUser() user: UserEntity, @UserAgent() userAgent: string) {
        await this.exists(id);

        await this.themeDownloadService.increment(id, ip, userAgent, user ? user.id : undefined);

        return {url: "download/theme.nxtheme"};
    }

    @Get("theme.nxtheme")
    @Header("Content-type", "application/nxtheme")
    async getDownloadFile(@Param("id") id: string, @Res() res: Response){
        await this.exists(id);

        const {data, fileName} = await this.themeCacheService.getFile(id);

        res.attachment(fileName)
        res.end(data, 'binary')
    }

}
