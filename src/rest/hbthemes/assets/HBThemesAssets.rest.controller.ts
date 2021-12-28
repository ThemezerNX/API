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

    @Get(HBThemeAssetsEntity.BATTERY_ICON_FILENAME)
    getBatteryIcon(@Param("id") id: string) {
        return this.getFile(id, "batteryIconFile");
    }

    @Get(HBThemeAssetsEntity.CHARGING_ICON_FILENAME)
    getChargingIcon(@Param("id") id: string) {
        return this.getFile(id, "chargingIconFile");
    }

    @Get(HBThemeAssetsEntity.FOLDER_ICON_FILENAME)
    getFolderIcon(@Param("id") id: string) {
        return this.getFile(id, "folderIconFile");
    }

    @Get(HBThemeAssetsEntity.INVALID_ICON_FILENAME)
    getInvalidIcon(@Param("id") id: string) {
        return this.getFile(id, "invalidIconFile");
    }

    @Get(HBThemeAssetsEntity.THEME_ICON_DARK_FILENAME)
    getThemeIconDark(@Param("id") id: string) {
        return this.getFile(id, "themeIconDarkFile");
    }

    @Get(HBThemeAssetsEntity.THEME_ICON_LIGHT_FILENAME)
    getThemeIconLight(@Param("id") id: string) {
        return this.getFile(id, "themeIconLightFile");
    }

    @Get(HBThemeAssetsEntity.AIRPLANE_ICON_FILENAME)
    getAirplaneIcon(@Param("id") id: string) {
        return this.getFile(id, "airplaneIconFile");
    }

    @Get(HBThemeAssetsEntity.WIFI_NONE_ICON_FILENAME)
    getWifiNoneIcon(@Param("id") id: string) {
        return this.getFile(id, "wifiNoneIconFile");
    }

    @Get(HBThemeAssetsEntity.WIFI1_ICON_FILENAME)
    getWifi1Icon(@Param("id") id: string) {
        return this.getFile(id, "wifi1IconFile");
    }

    @Get(HBThemeAssetsEntity.WIFI2_ICON_FILENAME)
    getWifi2Icon(@Param("id") id: string) {
        return this.getFile(id, "wifi2IconFile");
    }

    @Get(HBThemeAssetsEntity.WIFI3_ICON_FILENAME)
    getWifi3Icon(@Param("id") id: string) {
        return this.getFile(id, "wifi3IconFile");
    }

    @Get(HBThemeAssetsEntity.ETH_ICON_FILENAME)
    getEthIcon(@Param("id") id: string) {
        return this.getFile(id, "ethIconFile");
    }

    @Get(HBThemeAssetsEntity.ETH_NONE_ICON_FILENAME)
    getEthNoneIcon(@Param("id") id: string) {
        return this.getFile(id, "ethNoneIconFile");
    }

    @Get(HBThemeAssetsEntity.BACKGROUND_IMAGE_FILENAME)
    getBackgroundImage(@Param("id") id: string) {
        return this.getFile(id, "backgroundImageFile");
    }

}
