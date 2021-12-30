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

    @Get(ThemePreviewsEntity.IMAGE_720_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage720(@Param("id") id: string) {
        return this.getFile(id, "image720File");
    }

    @Get(ThemePreviewsEntity.IMAGE_360_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage360(@Param("id") id: string) {
        return this.getFile(id, "image360File");
    }

    @Get(ThemePreviewsEntity.IMAGE_240_FILENAME)
    @Header("Content-Type", "image/jpeg")
    getImage240(@Param("id") id: string) {
        return this.getFile(id, "image240File");
    }

    @Get(ThemePreviewsEntity.IMAGE_180_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage180(@Param("id") id: string) {
        return this.getFile(id, "image180File");
    }

}
