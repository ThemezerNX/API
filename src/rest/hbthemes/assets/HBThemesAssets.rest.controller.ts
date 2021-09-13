import {Controller, Get, NotFoundException, Param, StreamableFile} from "@nestjs/common";
import * as decode from "postgres-bytea";
import {HBThemeService} from "../../../graphql/HBTheme/HBTheme.service";
import {HBThemeAssetsEntity} from "../../../graphql/HBTheme/Assets/HBThemeAssets.entity";

@Controller()
export class HBThemesAssetsRestController {

    constructor(private hbthemeService: HBThemeService) {
    }

    private async getFile(id: string, property: keyof HBThemeAssetsEntity): Promise<StreamableFile> {
        const entity = await this.hbthemeService.findOne({id});
        const file = entity.assets[property];
        if (!entity || !file) {
            throw new NotFoundException();
        }
        return new StreamableFile(decode(entity.assets[property]));
    }

    @Get("batteryIcon.png")
    getBatteryIcon(@Param("id") id: string) {
        return this.getFile(id, "batteryIconFile");
    }

    @Get("chargingIcon.png")
    getChargingIcon(@Param("id") id: string) {
        return this.getFile(id, "chargingIconFile");
    }

    @Get("folderIcon.jpg")
    getFolderIcon(@Param("id") id: string) {
        return this.getFile(id, "folderIconFile");
    }

    @Get("invalidIcon.jpg")
    getInvalidIcon(@Param("id") id: string) {
        return this.getFile(id, "invalidIconFile");
    }

    @Get("themeIconDark.jpg")
    getThemeIconDark(@Param("id") id: string) {
        return this.getFile(id, "themeIconDarkFile");
    }

    @Get("themeIconLight.jpg")
    getThemeIconLight(@Param("id") id: string) {
        return this.getFile(id, "themeIconLightFile");
    }

    @Get("airplaneIcon.png")
    getAirplaneIcon(@Param("id") id: string) {
        return this.getFile(id, "airplaneIconFile");
    }

    @Get("wifiNoneIcon.png")
    getWifiNoneIcon(@Param("id") id: string) {
        return this.getFile(id, "wifiNoneIconFile");
    }

    @Get("wifi1Icon.png")
    getWifi1Icon(@Param("id") id: string) {
        return this.getFile(id, "wifi1IconFile");
    }

    @Get("wifi2Icon.png")
    getWifi2Icon(@Param("id") id: string) {
        return this.getFile(id, "wifi2IconFile");
    }

    @Get("wifi3Icon.png")
    getWifi3Icon(@Param("id") id: string) {
        return this.getFile(id, "wifi3IconFile");
    }

    @Get("ethIcon.png")
    getEthIcon(@Param("id") id: string) {
        return this.getFile(id, "ethIconFile");
    }

    @Get("backgroundImage.jpg")
    getBackgroundImage(@Param("id") id: string) {
        return this.getFile(id, "backgroundImageFile");
    }

}
