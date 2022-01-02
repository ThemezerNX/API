import {Controller, Get, Header, NotFoundException, Param, StreamableFile} from "@nestjs/common";
import {HBThemeService} from "../../../graphql/HBTheme/HBTheme.service";
import {HBThemePreviewsEntity} from "../../../graphql/HBTheme/Previews/HBThemePreviews.entity";
import {checkAccessPermissions} from "../../common/functions/checkAccessPermissions";
import {CurrentUser} from "../../../common/decorators/CurrentUser.decorator";
import {UserEntity} from "../../../graphql/User/User.entity";

@Controller()
export class HBThemesPreviewsRestController {

    constructor(private hbthemeService: HBThemeService) {
    }

    private async getFile(id: string, user: UserEntity, property: keyof HBThemePreviewsEntity): Promise<StreamableFile> {
        const entity = await this.hbthemeService.findOne({id}, {
            relations: {
                previews: [property],
            },
        });

        checkAccessPermissions(entity, user);

        const file = (entity?.previews[property] as Buffer);
        if (!entity || !file) {
            throw new NotFoundException();
        }
        return new StreamableFile(file);
    }

    @Get(HBThemePreviewsEntity.IMAGE_720_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage720(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "image720File");
    }

    @Get(HBThemePreviewsEntity.IMAGE_360_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage360(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "image360File");
    }

    @Get(HBThemePreviewsEntity.IMAGE_240_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage240(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "image240File");
    }

    @Get(HBThemePreviewsEntity.IMAGE_180_FILENAME)
    @Header("Content-Type", "image/webp")
    getImage180(@Param("id") id: string, @CurrentUser() user: UserEntity) {
        return this.getFile(id, user, "image180File");
    }

}
