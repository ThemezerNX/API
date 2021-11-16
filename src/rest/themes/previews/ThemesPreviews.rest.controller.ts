import {Controller, Get, Header, NotFoundException, Param, StreamableFile} from "@nestjs/common";
import {ThemeService} from "../../../graphql/Theme/Theme.service";
import {ThemePreviewsEntity} from "../../../graphql/Theme/Previews/ThemePreviews.entity";

@Controller()
export class ThemesPreviewsRestController {

    constructor(private themeService: ThemeService) {
    }

    private async getFile(id: string, property: keyof ThemePreviewsEntity): Promise<StreamableFile> {
        const entity = await this.themeService.findOne({id}, {
            relations: {
                previews: [property],
            },
        });
        const file = (entity?.previews[property] as Buffer);
        if (!entity || !file) {
            throw new NotFoundException();
        }
        return new StreamableFile(file);
    }

    @Get("720.webp")
    @Header("Content-Type", "image/webp")
    getImage720(@Param("id") id: string) {
        return this.getFile(id, "image720File");
    }

    @Get("360.webp")
    @Header("Content-Type", "image/webp")
    getImage360(@Param("id") id: string) {
        return this.getFile(id, "image360File");
    }

    @Get("240.jpg")
    @Header("Content-Type", "image/jpeg")
    getImage240(@Param("id") id: string) {
        return this.getFile(id, "image240File");
    }

    @Get("180.webp")
    @Header("Content-Type", "image/webp")
    getImage180(@Param("id") id: string) {
        return this.getFile(id, "image180File");
    }

    @Get("placeholder.webp")
    @Header("Content-Type", "image/webp")
    getImagePlaceholder(@Param("id") id: string) {
        return this.getFile(id, "imagePlaceholderFile");
    }

}
