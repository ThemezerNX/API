import {UserEntity} from "../../../graphql/User/User.entity";
import {UnauthorizedException} from "@nestjs/common";

export function checkAccessPermissions(item: { isPrivate: boolean, creatorId: string }, user: UserEntity): void {
    if (item && item.isPrivate && !(user && (item.creatorId == user.id || user.isAdmin))) {
        throw new UnauthorizedException();
    }
}