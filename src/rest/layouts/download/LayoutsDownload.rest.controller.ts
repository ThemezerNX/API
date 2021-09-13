import {Controller, Get, Header, NotFoundException, Param, Redirect, Res} from "@nestjs/common";
import {Response} from "express";
import {ClientIP} from "../../common/decorators/ClientIP.decorator";
import {CurrentUser} from "../../../graphql/common/decorators/CurrentUser.gql.decorator";
import {UserEntity} from "../../../graphql/User/User.entity";
import {UserAgent} from "../../common/decorators/UserAgent.decorator";
import {LayoutService} from "../../../graphql/Layout/Layout.service";
import {LayoutEntity} from "../../../graphql/Layout/Layout.entity";
import {LayoutDownloadService} from "../../../graphql/Layout/Download/LayoutDownload.service";

@Controller()
export class LayoutsDownloadRestController {

    constructor(private layoutService: LayoutService, private layoutDownloadService: LayoutDownloadService) {
    }

    private async exists(id: string): Promise<LayoutEntity> {
        const entity = await this.layoutService.findOne({id}, []);
        if (!entity) {
            throw new NotFoundException();
        }
        return entity;
    }

    @Get()
    @Redirect()
    async getDownload(@Param("id") id: string, @ClientIP() ip: string, @CurrentUser() user: UserEntity, @UserAgent() userAgent: string) {
        await this.exists(id);

        await this.layoutDownloadService.increment(id, ip, userAgent, user ? user.id : undefined);

        // use cache=false because layout.assets is not a thing -> no cache id is tracked
        return {url: "download/layout.json?cache=false"};
    }

    @Get("layout.json")
    @Header("Content-type", "application/json")
    async getDownloadFile(@Param("id") id: string, @Res() res: Response) {
        const item = await this.exists(id);

        res.attachment(item.name + ".json");
        res.end(item.json);
    }

    @Get()
    @Redirect()
    async getDownloadCommon(@Param("id") id: string, @ClientIP() ip: string, @CurrentUser() user: UserEntity, @UserAgent() userAgent: string) {
        await this.exists(id);

        // use cache=false because layout.assets is not a thing -> no cache id is tracked
        return {url: "download/commonLayout.json?cache=false"};
    }

    @Get("commonLayout.json")
    @Header("Content-type", "application/json")
    async getDownloadCommonFile(@Param("id") id: string, @Res() res: Response) {
        const item = await this.exists(id);

        res.attachment(item.name + "(common).json");
        res.end(item.commonJson);
    }

}
