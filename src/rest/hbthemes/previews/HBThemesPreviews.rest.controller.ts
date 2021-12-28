import {Controller, Get, Header, NotFoundException, Param, StreamableFile} from "@nestjs/common";
import {HBThemeService} from "../../../graphql/HBTheme/HBTheme.service";
import {HBThemePreviewsEntity} from "../../../graphql/HBTheme/Previews/HBThemePreviews.entity";

@Controller()
export class HBThemesPreviewsRestController {

    constructor(private hbthemeService: HBThemeService) {
    }

    private async getFile(id: string, property: keyof HBThemePreviewsEntity): Promise<StreamableFile> {
        const entity = await this.hbthemeService.findOne({id}, {
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

    @Get(HBThemePreviewsEntity.IMAGE_720_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage720(@Param("id") id: string) {
        return this.getFile(id, "image720File");
    }

    @Get(HBThemePreviewsEntity.IMAGE_360_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage360(@Param("id") id: string) {
        return this.getFile(id, "image360File");
    }

    @Get(HBThemePreviewsEntity.IMAGE_240_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage240(@Param("id") id: string) {
        return this.getFile(id, "image240File");
    }

    @Get(HBThemePreviewsEntity.IMAGE_180_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage180(@Param("id") id: string) {
        return this.getFile(id, "image180File");
    }

    @Get(HBThemePreviewsEntity.IMAGE_PLACEHOLDER_FILENAME)
    @Header("Content-Type", "image/webp")
    getImagePlaceholder(@Param("id") id: string) {
        return this.getFile(id, "imagePlaceholderFile");
    }

}
