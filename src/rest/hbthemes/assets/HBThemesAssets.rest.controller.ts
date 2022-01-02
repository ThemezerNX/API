import {Controller, Get, NotFoundException, Param, StreamableFile} from "@nestjs/common";
import {HBThemeService} from "../../../graphql/HBTheme/HBTheme.service";
import {HBThemeAssetsEntity} from "../../../graphql/HBTheme/Assets/HBThemeAssets.entity";
import {checkAccessPermissions} from "../../common/functions/checkAccessPermissions";
import {UserEntity} from "../../../graphql/User/User.entity";
import {CurrentUser} from "../../../common/decorators/CurrentUser.decorator";

@Controller()
export class HBThemesAssetsRestController {

    constructor(private hbthemeService: HBThemeService) {
    }

    private async getFile(id: string, user: UserEntity, property: keyof HBThemeAssetsEntity): Promise<StreamableFile> {
        const entity = await this.hbthemeService.findOne({id});

        checkAccessPermissions(entity, user);

        const file = (entity?.assets[property] as Buffer);
        if (!entity || !file) {
            throw new NotFoundException();
        }
        return new StreamableFile(file);
    }

    @Get(HBThemeAssetsEntity.ICON_FILE.name)
    getIcon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "iconFile");
    }

    @Get(HBThemeAssetsEntity.BATTERY_ICON_FILE.name)
    getBatteryIcon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "batteryIconFile");
    }

    @Get(HBThemeAssetsEntity.CHARGING_ICON_FILE.name)
    getChargingIcon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "chargingIconFile");
    }

    @Get(HBThemeAssetsEntity.FOLDER_ICON_FILE.name)
    getFolderIcon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "folderIconFile");
    }

    @Get(HBThemeAssetsEntity.INVALID_ICON_FILE.name)
    getInvalidIcon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "invalidIconFile");
    }

    @Get(HBThemeAssetsEntity.THEME_ICON_DARK_FILE.name)
    getThemeIconDark(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "themeIconDarkFile");
    }

    @Get(HBThemeAssetsEntity.THEME_ICON_LIGHT_FILE.name)
    getThemeIconLight(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "themeIconLightFile");
    }

    @Get(HBThemeAssetsEntity.AIRPLANE_ICON_FILE.name)
    getAirplaneIcon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "airplaneIconFile");
    }

    @Get(HBThemeAssetsEntity.WIFI_NONE_ICON_FILE.name)
    getWifiNoneIcon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "wifiNoneIconFile");
    }

    @Get(HBThemeAssetsEntity.WIFI1_ICON_FILE.name)
    getWifi1Icon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "wifi1IconFile");
    }

    @Get(HBThemeAssetsEntity.WIFI2_ICON_FILE.name)
    getWifi2Icon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "wifi2IconFile");
    }

    @Get(HBThemeAssetsEntity.WIFI3_ICON_FILE.name)
    getWifi3Icon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "wifi3IconFile");
    }

    @Get(HBThemeAssetsEntity.ETH_ICON_FILE.name)
    getEthIcon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "ethIconFile");
    }

    @Get(HBThemeAssetsEntity.ETH_NONE_ICON_FILE.name)
    getEthNoneIcon(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "ethNoneIconFile");
    }

    @Get(HBThemeAssetsEntity.BACKGROUND_IMAGE_FILE.name)
    getBackgroundImage(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "backgroundImageFile");
    }

}
