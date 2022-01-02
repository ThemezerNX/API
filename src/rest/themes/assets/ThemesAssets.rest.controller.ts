import {Controller, Get, NotFoundException, Param, StreamableFile} from "@nestjs/common";
import {ThemeService} from "../../../graphql/Theme/Theme.service";
import {ThemeAssetsEntity} from "../../../graphql/Theme/Assets/ThemeAssets.entity";
import {checkAccessPermissions} from "../../common/functions/checkAccessPermissions";
import {UserEntity} from "../../../graphql/User/User.entity";
import {CurrentUser} from "../../../common/decorators/CurrentUser.decorator";

@Controller()
export class ThemesAssetsRestController {

    constructor(private themeService: ThemeService) {
    }

    private async getFile(id: string, user: UserEntity, property: keyof ThemeAssetsEntity): Promise<StreamableFile> {
        const entity = await this.themeService.findOne({id});

        checkAccessPermissions(entity, user);

        const file = (entity?.assets[property] as Buffer);
        if (!entity || !file) {
            throw new NotFoundException();
        }
        return new StreamableFile(file);
    }

    @Get(ThemeAssetsEntity.BACKGROUND_IMAGE_FILE.name)
    getImage(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "backgroundImageFile");
    }

    @Get(ThemeAssetsEntity.ALBUM_ICON_FILE.name)
    getAlbumIcon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "albumIconFile");
    }

    @Get(ThemeAssetsEntity.NEWS_ICON_FILE.name)
    getNewsIcon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "newsIconFile");
    }

    @Get(ThemeAssetsEntity.SHOP_ICON_FILE.name)
    getShopIcon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "shopIconFile");
    }

    @Get(ThemeAssetsEntity.CONTROLLER_ICON_FILE.name)
    getControllerIcon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "controllerIconFile");
    }

    @Get(ThemeAssetsEntity.SETTINGS_ICON_FILE.name)
    getSettingsIcon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "settingsIconFile");
    }

    @Get(ThemeAssetsEntity.POWER_ICON_FILE.name)
    getPowerIcon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "powerIconFile");
    }

    @Get(ThemeAssetsEntity.HOME_ICON_FILE.name)
    getHomeIcon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "homeIconFile");
    }

}
