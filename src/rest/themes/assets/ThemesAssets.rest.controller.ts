import {Controller, Get, NotFoundException, Param, StreamableFile} from "@nestjs/common";
import {ThemeService} from "../../../graphql/Theme/Theme.service";
import {ThemeAssetsEntity} from "../../../graphql/Theme/Assets/ThemeAssets.entity";

@Controller()
export class ThemesAssetsRestController {

    constructor(private themeService: ThemeService) {
    }

    private async getFile(id: string, property: keyof ThemeAssetsEntity): Promise<StreamableFile> {
        const entity = await this.themeService.findOne({id});
        const file = (entity?.assets[property] as Buffer);
        if (!entity || !file) {
            throw new NotFoundException();
        }
        return new StreamableFile(file);
    }

    @Get("image.jpg")
    getImage(@Param("id") id: string) {
        return this.getFile(id, "imageFile");
    }

    @Get("albumIcon.png")
    getAlbumIcon(@Param("id") id: string) {
        return this.getFile(id, "albumIconFile");
    }

    @Get("newsIcon.png")
    getNewsIcon(@Param("id") id: string) {
        return this.getFile(id, "newsIconFile");
    }

    @Get("shopIcon.png")
    getShopIcon(@Param("id") id: string) {
        return this.getFile(id, "shopIconFile");
    }

    @Get("controllerIcon.png")
    getControllerIcon(@Param("id") id: string) {
        return this.getFile(id, "controllerIconFile");
    }

    @Get("settingsIcon.png")
    getSettingsIcon(@Param("id") id: string) {
        return this.getFile(id, "settingsIconFile");
    }

    @Get("powerIcon.png")
    getPowerIcon(@Param("id") id: string) {
        return this.getFile(id, "powerIconFile");
    }

    @Get("homeIcon.png")
    getHomeIcon(@Param("id") id: string) {
        return this.getFile(id, "homeIconFile");
    }

}
