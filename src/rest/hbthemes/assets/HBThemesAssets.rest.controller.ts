import {Controller, Get, NotFoundException, Param, StreamableFile} from "@nestjs/common";
import {HBThemeService} from "../../../graphql/HBTheme/HBTheme.service";
import {HBThemeAssetsEntity} from "../../../graphql/HBTheme/Assets/HBThemeAssets.entity";

@Controller()
export class HBThemesAssetsRestController {

    constructor(private hbthemeService: HBThemeService) {
    }

    private async getFile(id: string, property: keyof HBThemeAssetsEntity): Promise<StreamableFile> {
        const entity = await this.hbthemeService.findOne({id});
        const file = (entity?.assets[property] as Buffer);
        if (!entity || !file) {
            throw new NotFoundException();
        }
        return new StreamableFile(file);
    }

    @Get(HBThemeAssetsEntity.ICON_FILE.name)
    getIcon(@Param("id") id: string) {
        return this.getFile(id, "iconFile");
    }

    @Get(HBThemeAssetsEntity.BATTERY_ICON_FILE.name)
    getBatteryIcon(@Param("id") id: string) {
        return this.getFile(id, "batteryIconFile");
    }

    @Get(HBThemeAssetsEntity.CHARGING_ICON_FILE.name)
    getChargingIcon(@Param("id") id: string) {
        return this.getFile(id, "chargingIconFile");
    }

    @Get(HBThemeAssetsEntity.FOLDER_ICON_FILE.name)
    getFolderIcon(@Param("id") id: string) {
        return this.getFile(id, "folderIconFile");
    }

    @Get(HBThemeAssetsEntity.INVALID_ICON_FILE.name)
    getInvalidIcon(@Param("id") id: string) {
        return this.getFile(id, "invalidIconFile");
    }

    @Get(HBThemeAssetsEntity.THEME_ICON_DARK_FILE.name)
    getThemeIconDark(@Param("id") id: string) {
        return this.getFile(id, "themeIconDarkFile");
    }

    @Get(HBThemeAssetsEntity.THEME_ICON_LIGHT_FILE.name)
    getThemeIconLight(@Param("id") id: string) {
        return this.getFile(id, "themeIconLightFile");
    }

    @Get(HBThemeAssetsEntity.AIRPLANE_ICON_FILE.name)
    getAirplaneIcon(@Param("id") id: string) {
        return this.getFile(id, "airplaneIconFile");
    }

    @Get(HBThemeAssetsEntity.WIFI_NONE_ICON_FILE.name)
    getWifiNoneIcon(@Param("id") id: string) {
        return this.getFile(id, "wifiNoneIconFile");
    }

    @Get(HBThemeAssetsEntity.WIFI1_ICON_FILE.name)
    getWifi1Icon(@Param("id") id: string) {
        return this.getFile(id, "wifi1IconFile");
    }

    @Get(HBThemeAssetsEntity.WIFI2_ICON_FILE.name)
    getWifi2Icon(@Param("id") id: string) {
        return this.getFile(id, "wifi2IconFile");
    }

    @Get(HBThemeAssetsEntity.WIFI3_ICON_FILE.name)
    getWifi3Icon(@Param("id") id: string) {
        return this.getFile(id, "wifi3IconFile");
    }

    @Get(HBThemeAssetsEntity.ETH_ICON_FILE.name)
    getEthIcon(@Param("id") id: string) {
        return this.getFile(id, "ethIconFile");
    }

    @Get(HBThemeAssetsEntity.ETH_NONE_ICON_FILE.name)
    getEthNoneIcon(@Param("id") id: string) {
        return this.getFile(id, "ethNoneIconFile");
    }

    @Get(HBThemeAssetsEntity.BACKGROUND_IMAGE_FILE.name)
    getBackgroundImage(@Param("id") id: string) {
        return this.getFile(id, "backgroundImageFile");
    }

}
