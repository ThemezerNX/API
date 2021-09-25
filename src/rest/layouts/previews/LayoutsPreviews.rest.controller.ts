import {Controller, Get, Header, NotFoundException, Param, StreamableFile} from "@nestjs/common";
import {LayoutService} from "../../../graphql/Layout/Layout.service";
import {LayoutPreviewsEntity} from "../../../graphql/Layout/Previews/LayoutPreviews.entity";

@Controller()
export class LayoutsPreviewsRestController {

    constructor(private layoutService: LayoutService) {
    }

    private async getFile(id: string, property: keyof LayoutPreviewsEntity): Promise<StreamableFile> {
        const entity = await this.layoutService.findOne({id}, ["previews"], true);
        const file = (entity?.previews[property] as Buffer);
        if (!entity || !file) {
            throw new NotFoundException();
        }
        return new StreamableFile(file);
    }

    @Get("720.webp")
    @Header('Content-Type', 'image/webp')
    getImage720(@Param("id") id: string) {
        return this.getFile(id, "image720File");
    }

    @Get("360.webp")
    @Header('Content-Type', 'image/webp')
    getImage360(@Param("id") id: string) {
        return this.getFile(id, "image360File");
    }

    @Get("240.webp")
    @Header('Content-Type', 'image/webp')
    getImage240(@Param("id") id: string) {
        return this.getFile(id, "image240File");
    }

    @Get("180.webp")
    @Header('Content-Type', 'image/webp')
    getImage180(@Param("id") id: string) {
        return this.getFile(id, "image180File");
    }

    @Get("placeholder.webp")
    @Header('Content-Type', 'image/webp')
    getImagePlaceholder(@Param("id") id: string) {
        return this.getFile(id, "imagePlaceholderFile");
    }

}