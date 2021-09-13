import {Controller, Get, NotFoundException, Param, StreamableFile} from "@nestjs/common";
import * as decode from "postgres-bytea";
import {HBThemeService} from "../../../graphql/HBTheme/HBTheme.service";
import {HBThemePreviewsEntity} from "../../../graphql/HBTheme/Previews/HBThemePreviews.entity";

@Controller()
export class HBThemesPreviewsRestController {

    constructor(private hbthemeService: HBThemeService) {
    }

    private async getFile(id: string, property: keyof HBThemePreviewsEntity): Promise<StreamableFile> {
        const entity = await this.hbthemeService.findOne({id}, ["previews"]);
        const file = entity.previews[property];
        if (!entity || !file) {
            throw new NotFoundException();
        }
        return new StreamableFile(decode(entity.previews[property]));
    }

    @Get("720.webp")
    getImage720(@Param("id") id: string) {
        return this.getFile(id, "image720File");
    }

    @Get("360.webp")
    getImage360(@Param("id") id: string) {
        return this.getFile(id, "image360File");
    }

    @Get("240.webp")
    getImage240(@Param("id") id: string) {
        return this.getFile(id, "image240File");
    }

    @Get("180.webp")
    getImage180(@Param("id") id: string) {
        return this.getFile(id, "image180File");
    }

    @Get("placeholder.webp")
    getImagePlaceholder(@Param("id") id: string) {
        return this.getFile(id, "imagePlaceholderFile");
    }

}
