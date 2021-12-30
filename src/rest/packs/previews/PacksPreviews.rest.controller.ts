import {Controller, Get, Header, NotFoundException, Param, StreamableFile} from "@nestjs/common";
import {PackService} from "../../../graphql/Pack/Pack.service";
import {PackPreviewsEntity} from "../../../graphql/Pack/Previews/PackPreviews.entity";

@Controller()
export class PacksPreviewsRestController {

    constructor(private packService: PackService) {
    }

    private async getFile(id: string, property: keyof PackPreviewsEntity): Promise<StreamableFile> {
        const entity = await this.packService.findOne({id}, {
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

    @Get(PackPreviewsEntity.IMAGE_720_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage720(@Param("id") id: string) {
        return this.getFile(id, "image720File");
    }

    @Get(PackPreviewsEntity.IMAGE_360_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage360(@Param("id") id: string) {
        return this.getFile(id, "image360File");
    }

    @Get(PackPreviewsEntity.IMAGE_240_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage240(@Param("id") id: string) {
        return this.getFile(id, "image240File");
    }

    @Get(PackPreviewsEntity.IMAGE_180_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage180(@Param("id") id: string) {
        return this.getFile(id, "image180File");
    }

}
