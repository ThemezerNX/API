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

    @Get(ThemeAssetsEntity.IMAGE_FILENAME)
    getImage(@Param("id") id: string) {
        return this.getFile(id, "imageFile");
    }

    @Get(ThemeAssetsEntity.ALBUM_ICON_FILENAME)
    getAlbumIcon(@Param("id") id: string) {
        return this.getFile(id, "albumIconFile");
    }

    @Get(ThemeAssetsEntity.NEWS_ICON_FILENAME)
    getNewsIcon(@Param("id") id: string) {
        return this.getFile(id, "newsIconFile");
    }

    @Get(ThemeAssetsEntity.SHOP_ICON_FILENAME)
    getShopIcon(@Param("id") id: string) {
        return this.getFile(id, "shopIconFile");
    }

    @Get(ThemeAssetsEntity.CONTROLLER_ICON_FILENAME)
    getControllerIcon(@Param("id") id: string) {
        return this.getFile(id, "controllerIconFile");
    }

    @Get(ThemeAssetsEntity.SETTINGS_ICON_FILENAME)
    getSettingsIcon(@Param("id") id: string) {
        return this.getFile(id, "settingsIconFile");
    }

    @Get(ThemeAssetsEntity.POWER_ICON_FILENAME)
    getPowerIcon(@Param("id") id: string) {
        return this.getFile(id, "powerIconFile");
    }

    @Get(ThemeAssetsEntity.HOME_ICON_FILENAME)
    getHomeIcon(@Param("id") id: string) {
        return this.getFile(id, "homeIconFile");
    }

}
