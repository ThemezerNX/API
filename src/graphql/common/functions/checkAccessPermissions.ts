import {UserEntity} from "../../User/User.entity";
import {UnauthenticatedError} from "../errors/auth/Unauthenticated.error";

export function checkAccessPermissions(item: { isPrivate: boolean, creatorId: string }, user: UserEntity): void {
    if (item && item.isPrivate && !(user && (item.creatorId == user.id || user.isAdmin))) {
        throw new UnauthenticatedError();
    }
}