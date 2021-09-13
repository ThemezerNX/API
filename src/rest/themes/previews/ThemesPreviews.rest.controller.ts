import {Controller, Get, NotFoundException, Param, StreamableFile} from "@nestjs/common";
import * as decode from "postgres-bytea";
import {ThemeService} from "../../../graphql/Theme/Theme.service";
import {ThemePreviewsEntity} from "../../../graphql/Theme/Previews/ThemePreviews.entity";

@Controller()
export class ThemesPreviewsRestController {

    constructor(private themeService: ThemeService) {
    }

    private async getFile(id: string, property: keyof ThemePreviewsEntity): Promise<StreamableFile> {
        const entity = await this.themeService.findOne({id}, ["previews"]);
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

    @Get("240.jpg")
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
