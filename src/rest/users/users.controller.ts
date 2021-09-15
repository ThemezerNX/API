import {Controller, Get, NotFoundException, Param, StreamableFile} from "@nestjs/common";
import {UserService} from "../../graphql/User/User.service";
import {UserProfileEntity} from "../../graphql/User/Profile/UserProfile.entity";

@Controller(":id")
export class UsersController {

    constructor(private userService: UserService) {
    }

    private async getFile(id: string, property: keyof UserProfileEntity) {
        const entity = await this.userService.findOne({id});
        const file = (entity?.profile[property] as Buffer);
        if (!entity || !file) {
            throw new NotFoundException();
        }
        return new StreamableFile(file);
    }

    @Get("banner.webp")
    getBanner(@Param("id") id: string): Promise<StreamableFile> {
        return this.getFile(id, "bannerFile");
    }

    @Get("avatar.webp")
    getAvatar(@Param("id") id: string): Promise<StreamableFile> {
        return this.getFile(id, "avatarFile");
    }

}
