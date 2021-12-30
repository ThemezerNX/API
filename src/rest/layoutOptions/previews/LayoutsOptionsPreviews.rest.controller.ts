import {Controller, Get, Header, NotFoundException, Param, StreamableFile} from "@nestjs/common";
import {LayoutOptionValuePreviewsEntity} from "../../../graphql/LayoutOption/OptionValuePreviews/LayoutOptionValuePreviews.entity";
import {LayoutOptionService} from "../../../graphql/LayoutOption/LayoutOption.service";

@Controller()
export class LayoutsOptionsPreviewsRestController {

    constructor(private layoutOptionService: LayoutOptionService) {
    }

    private async getFile(uuid: string, property: keyof LayoutOptionValuePreviewsEntity): Promise<StreamableFile> {
        const entity = await this.layoutOptionService.findValue({uuid}, {
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

    @Get(LayoutOptionValuePreviewsEntity.IMAGE_720_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage720(@Param("uuid") uuid: string) {
        return this.getFile(uuid, "image720File");
    }

    @Get(LayoutOptionValuePreviewsEntity.IMAGE_360_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage360(@Param("uuid") uuid: string) {
        return this.getFile(uuid, "image360File");
    }

    @Get(LayoutOptionValuePreviewsEntity.IMAGE_240_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage240(@Param("uuid") uuid: string) {
        return this.getFile(uuid, "image240File");
    }

    @Get(LayoutOptionValuePreviewsEntity.IMAGE_180_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage180(@Param("uuid") uuid: string) {
        return this.getFile(uuid, "image180File");
    }

}
