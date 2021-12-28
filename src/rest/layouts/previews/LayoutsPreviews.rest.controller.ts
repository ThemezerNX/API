import {Controller, Get, Header, NotFoundException, Param, StreamableFile} from "@nestjs/common";
import {LayoutService} from "../../../graphql/Layout/Layout.service";
import {LayoutPreviewsEntity} from "../../../graphql/Layout/Previews/LayoutPreviews.entity";

@Controller()
export class LayoutsPreviewsRestController {

    constructor(private layoutService: LayoutService) {
    }

    private async getFile(id: string, property: keyof LayoutPreviewsEntity): Promise<StreamableFile> {
        const entity = await this.layoutService.findOne({id}, {
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

    @Get(LayoutPreviewsEntity.IMAGE_720_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage720(@Param("id") id: string) {
        return this.getFile(id, "image720File");
    }

    @Get(LayoutPreviewsEntity.IMAGE_360_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage360(@Param("id") id: string) {
        return this.getFile(id, "image360File");
    }

    @Get(LayoutPreviewsEntity.IMAGE_240_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage240(@Param("id") id: string) {
        return this.getFile(id, "image240File");
    }

    @Get(LayoutPreviewsEntity.IMAGE_180_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage180(@Param("id") id: string) {
        return this.getFile(id, "image180File");
    }

    @Get(LayoutPreviewsEntity.IMAGE_PLACEHOLDER_FILENAME)
    @Header("Content-Type", "image/webp")
    getImagePlaceholder(@Param("id") id: string) {
        return this.getFile(id, "imagePlaceholderFile");
    }

}
